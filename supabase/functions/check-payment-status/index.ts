// AcceptPay Payment Status Check for MenForceToys
// This edge function checks payment status from AcceptPay and updates our database

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// AcceptPay API configuration
const ACCEPTPAY_API_URL = 'https://acceptpay.publicvm.com'
const ACCEPTPAY_API_KEY = Deno.env.get('ACCEPTPAY_API_KEY') ?? ''
const ACCEPTPAY_API_SECRET = Deno.env.get('ACCEPTPAY_API_SECRET') ?? ''

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  console.log('=== AcceptPay Payment Status Check ===')

  try {
    // Get parameters from URL or body
    const url = new URL(req.url)
    let transactionId = url.searchParams.get('transactionId')
    let orderId = url.searchParams.get('orderId')
    let orderNumber = url.searchParams.get('orderNumber')

    // If POST, also check body
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        transactionId = transactionId || body.transactionId
        orderId = orderId || body.orderId
        orderNumber = orderNumber || body.orderNumber
      } catch (e) {
        // Ignore body parse errors
      }
    }

    console.log('📋 Request params:', { transactionId, orderId, orderNumber })

    if (!transactionId && !orderId && !orderNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Either transactionId, orderId, or orderNumber is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find the payment transaction or order
    let paymentTxn = null
    let order = null

    if (transactionId) {
      // Check AcceptPay API for status first
      console.log('🔍 Checking AcceptPay status for:', transactionId)

      try {
        const acceptPayResponse = await fetch(
          `${ACCEPTPAY_API_URL}/api/v1/transaction/status-of-transaction/${transactionId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )

        if (acceptPayResponse.ok) {
          const acceptPayData = await acceptPayResponse.json()
          console.log('📥 AcceptPay status response:', acceptPayData)

          if (acceptPayData.status === 'success' && acceptPayData.result) {
            const gatewayStatus = acceptPayData.result.status
            const gatewayVpaId = acceptPayData.result.vpaId
            const gatewayPaidAt = acceptPayData.result.paidAt

            // Update our database with the latest status
            const { data: existingTxn } = await supabaseClient
              .from('payment_transactions')
              .select('*, order_id')
              .eq('transaction_id', transactionId)
              .maybeSingle()

            if (existingTxn) {
              paymentTxn = existingTxn

              // Map status
              let mappedStatus = 'pending'
              const statusLower = gatewayStatus?.toLowerCase() || ''
              if (statusLower === 'completed' || statusLower === 'success') {
                mappedStatus = 'success'
              } else if (statusLower === 'failed') {
                mappedStatus = 'failed'
              } else if (statusLower === 'timeout' || statusLower === 'cancelled') {
                mappedStatus = 'cancelled'
              }

              // Update payment transaction if status changed
              if (existingTxn.status !== mappedStatus && mappedStatus !== 'pending') {
                console.log('🔄 Updating payment status:', existingTxn.status, '->', mappedStatus)

                await supabaseClient
                  .from('payment_transactions')
                  .update({
                    status: mappedStatus,
                    vpa_id: gatewayVpaId,
                    processed_at: gatewayPaidAt || (mappedStatus === 'success' ? new Date().toISOString() : null),
                    updated_at: new Date().toISOString(),
                    gateway_response: acceptPayData
                  })
                  .eq('id', existingTxn.id)

                // Also update order
                if (existingTxn.order_id) {
                  await supabaseClient
                    .from('orders')
                    .update({
                      payment_status: mappedStatus === 'success' ? 'paid' : mappedStatus,
                      status: mappedStatus === 'success' ? 'confirmed' : 'cancelled',
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', existingTxn.order_id)
                }
              }

              paymentTxn = {
                ...existingTxn,
                status: mappedStatus !== 'pending' ? mappedStatus : existingTxn.status,
                vpa_id: gatewayVpaId || existingTxn.vpa_id,
                gateway_response: acceptPayData
              }
            }
          }
        }
      } catch (gatewayError) {
        console.error('⚠️ AcceptPay API error:', gatewayError)
      }

      // Get from our database if not already retrieved
      if (!paymentTxn) {
        const { data } = await supabaseClient
          .from('payment_transactions')
          .select('*')
          .eq('transaction_id', transactionId)
          .maybeSingle()
        paymentTxn = data
      }
    }

    if (orderId && !paymentTxn) {
      const { data } = await supabaseClient
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      paymentTxn = data
    }

    if (orderNumber && !paymentTxn) {
      // First find the order
      const { data: orderData } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .maybeSingle()

      if (orderData) {
        order = orderData
        const { data } = await supabaseClient
          .from('payment_transactions')
          .select('*')
          .eq('order_id', orderData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        paymentTxn = data
      }
    }

    // Get order details if we have a payment transaction
    if (paymentTxn && paymentTxn.order_id && !order) {
      const { data } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', paymentTxn.order_id)
        .maybeSingle()
      order = data
    }

    // Build response
    const response = {
      success: true,
      data: {
        transactionId: paymentTxn?.transaction_id || transactionId,
        status: paymentTxn?.status || 'not_found',
        amount: paymentTxn?.amount ? paymentTxn.amount / 100 : null, // Convert from paise
        currency: paymentTxn?.currency || 'INR',
        gateway: paymentTxn?.gateway || 'acceptpay',
        vpaId: paymentTxn?.vpa_id,
        bankRef: paymentTxn?.bank_ref,
        createdAt: paymentTxn?.created_at,
        processedAt: paymentTxn?.processed_at,
        order: order ? {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          paymentStatus: order.payment_status,
          totalAmount: order.total_amount / 100, // Convert from paise
          customerName: order.full_name,
          phone: order.phone
        } : null
      }
    }

    console.log('✅ Status check response:', JSON.stringify(response, null, 2))

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Payment status check error:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to check payment status'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})