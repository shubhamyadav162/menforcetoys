import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Accept, Origin'
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  console.log('=== REAL PAYMENT STATUS FUNCTION ===')

  try {
    // Get payment ID from URL
    const url = new URL(req.url)
    const paymentId = url.searchParams.get('paymentId')
    const orderId = url.searchParams.get('orderId')

    console.log('Extracted paymentId:', paymentId)
    console.log('Extracted orderId:', orderId)

    if (!paymentId && !orderId) {
      throw new Error('Either paymentId or orderId is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      }
    )

    let query = supabaseClient
      .from('payment_transactions')
      .select(`
        *,
        orders!inner(
          id,
          user_id,
          status,
          payment_status,
          total_amount,
          created_at
        )
      `)

    if (paymentId) {
      query = query.eq('id', paymentId)
    } else if (orderId) {
      query = query.eq('order_id', orderId)
    }

    const { data: payment, error: paymentError } = await query.single()

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError)
      throw new Error('Payment transaction not found')
    }

    console.log('✅ Payment transaction found:', payment)

    // Check if payment has expired
    const isExpired = payment.expires_at && new Date(payment.expires_at) < new Date()

    // Update expired transactions
    if (isExpired && payment.status === 'pending') {
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'cancelled',
          gateway_status: 'EXPIRED',
          updated_at: new Date().toISOString(),
          callback_data: {
            reason: 'expired',
            expired_at: payment.expires_at
          }
        })
        .eq('id', payment.id)

      payment.status = 'cancelled'
      payment.gateway_status = 'EXPIRED'
    }

    // Also query external payment gateway for real-time status
    let gatewayStatus = null
    try {
      const merchantId = Deno.env.get('TOYS4PEACE_MERCHANT_ID')
      const secretKey = Deno.env.get('TOYS4PEACE_SECRET_KEY')

      if (merchantId && secretKey && payment.gateway_transaction_id) {
        const authString = `${merchantId}:${secretKey}`
        const encodedAuth = btoa(authString)

        const gatewayResponse = await fetch(
          `https://rest.toys4peace.workers.dev/api/transactions?orderId=${payment.gateway_order_id}`,
          {
            headers: {
              'Authorization': `Basic ${encodedAuth}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (gatewayResponse.ok) {
          const gatewayData = await gatewayResponse.json()

          if (gatewayData.success && gatewayData.data.transactions.length > 0) {
            const latestTransaction = gatewayData.data.transactions[0]
            gatewayStatus = latestTransaction

            // Update local status if different
            if (latestTransaction.status.toLowerCase() !== payment.status &&
                payment.status !== 'completed') {

              const newStatus = latestTransaction.status.toLowerCase() === 'completed' ? 'completed' :
                              latestTransaction.status.toLowerCase() === 'cancelled' ? 'cancelled' :
                              latestTransaction.status.toLowerCase() === 'failed' ? 'failed' : 'pending'

              await supabaseClient
                .from('payment_transactions')
                .update({
                  status: newStatus,
                  gateway_status: latestTransaction.status,
                  updated_at: new Date().toISOString()
                })
                .eq('id', payment.id)

              // Update order status if payment is completed
              if (newStatus === 'completed') {
                await supabaseClient
                  .from('orders')
                  .update({
                    payment_status: 'paid',
                    status: 'confirmed',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', payment.order_id)
              }
            }
          }
        }
      }
    } catch (gatewayError) {
      console.error('Gateway status check failed:', gatewayError)
    }

    // Calculate time remaining
    let timeRemaining = null
    if (payment.expires_at && payment.status === 'pending') {
      const remaining = new Date(payment.expires_at).getTime() - new Date().getTime()
      timeRemaining = Math.max(0, Math.floor(remaining / 1000)) // seconds
    }

    const response = {
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        gatewayOrderId: payment.gateway_order_id,
        gatewayTransactionId: payment.gateway_transaction_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        gatewayStatus: payment.gateway_status,
        upiString: payment.upi_string,
        vpaId: payment.vpa_id,
        bankRef: payment.bank_ref,
        createdAt: payment.created_at,
        expiresAt: payment.expires_at,
        completedAt: payment.completed_at,
        timeRemaining,
        isExpired,
        gatewayInfo: gatewayStatus ? {
          status: gatewayStatus.status,
          vpa_id: gatewayStatus.vpa_id,
          ref_id: gatewayStatus.ref_id,
          createdAt: gatewayStatus.createdAt
        } : null,
        order: {
          id: payment.orders.id,
          status: payment.orders.status,
          paymentStatus: payment.orders.payment_status,
          totalAmount: payment.orders.total_amount
        }
      }
    }

    console.log('✅ Payment status retrieved successfully:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Payment status check error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to check payment status'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})