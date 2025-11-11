import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Accept, Origin'
}

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

  try {
    // Check Accept header
    const acceptHeader = req.headers.get('Accept') || '';
    if (!acceptHeader.includes('application/json') && !acceptHeader.includes('*/*')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Not Acceptable - Only JSON responses are supported'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 406
        }
      )
    }

    const authHeader = req.headers.get('Authorization') ?? undefined
    const clientOptions = authHeader
      ? {
        global: {
          headers: { Authorization: authHeader }
        }
      }
      : undefined

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      clientOptions
    )

    // Get payment ID from URL
    const url = new URL(req.url)
    const paymentId = url.searchParams.get('paymentId')
    const orderId = url.searchParams.get('orderId')

    if (!paymentId && !orderId) {
      throw new Error('Either paymentId or orderId is required')
    }

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
      throw new Error('Payment transaction not found')
    }

    // Check if the user has access to this payment
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user || payment.orders.user_id !== user.id) {
      throw new Error('Access denied')
    }

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
      // Don't fail the request if gateway check fails
    }

    // Calculate time remaining
    let timeRemaining = null
    if (payment.expires_at && payment.status === 'pending') {
      const remaining = new Date(payment.expires_at).getTime() - new Date().getTime()
      timeRemaining = Math.max(0, Math.floor(remaining / 1000)) // seconds
    }

    return new Response(
      JSON.stringify({
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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Payment status check error:', error)

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