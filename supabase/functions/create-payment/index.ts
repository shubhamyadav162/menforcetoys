import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Accept, Origin'
}

// Payment Gateway Configuration
const PAYMENT_API_URL = 'https://api.toys4peace.workers.dev/transaction'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

console.log('=== REAL PAYMENT GATEWAY FUNCTION ===');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)

  try {
    // Parse request body
    const text = await req.text()
    console.log('Raw request body:', text)

    if (!text) {
      throw new Error('Empty request body')
    }

    const requestBody = JSON.parse(text)
    console.log('Parsed request body:', requestBody)

    const { orderId, amountPaisa, frontendRedirectUrl } = requestBody

    if (!orderId || !amountPaisa) {
      throw new Error(`Missing required fields: orderId=${!!orderId}, amountPaisa=${!!amountPaisa}`)
    }

    console.log('✅ Request validation successful')
    console.log('Order ID:', orderId)
    console.log('Amount (paisa):', amountPaisa)

    // Initialize Supabase client with service role for elevated permissions
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

    // Verify order exists
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, total_amount, status, payment_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderError)
      throw new Error('Order not found')
    }

    console.log('✅ Order found:', order)

    // Check if payment already exists
    const { data: existingPayment } = await supabaseClient
      .from('payment_transactions')
      .select('id, status')
      .eq('order_id', orderId)
      .eq('status', 'completed')
      .single()

    if (existingPayment) {
      throw new Error('Payment already completed for this order')
    }

    // Get merchant credentials from environment
    const merchantId = Deno.env.get('TOYS4PEACE_MERCHANT_ID')
    const secretKey = Deno.env.get('TOYS4PEACE_SECRET_KEY')

    // Enable real Toys4Peace payment gateway - merchant account is now activated!
    const useGateway = Boolean(merchantId && secretKey && PAYMENT_API_URL)

    // Create gateway order ID
    const gatewayOrderId = `NP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create payment transaction record
    const expiresAt = new Date(Date.now() + (180 * 1000)) // 3 minutes

    const { data: paymentTransaction, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        amount: amountPaisa / 100, // Convert to rupees
        currency: 'INR',
        gateway: 'toys4peace',
        gateway_order_id: gatewayOrderId,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        payment_method: {
          type: 'upi',
          gateway: 'toys4peace'
        }
      })
      .select()
      .single()

    if (paymentError || !paymentTransaction) {
      console.error('Payment transaction creation failed:', paymentError)
      throw new Error('Failed to create payment transaction record')
    }

    console.log('✅ Payment transaction created:', paymentTransaction)

    let gatewayTransactionId: string | undefined
    let upiString: string

    if (useGateway) {
      console.log('Using real payment gateway...')

      const paymentRequest = {
        amountPaisa,
        orderId: gatewayOrderId,
        callbackUrl: `https://ctdakdqpmntycertugvz.supabase.co/functions/v1/payment-webhook`
      }

      const authString = `${merchantId}:${secretKey}`
      const encodedAuth = btoa(authString)

      console.log('Calling payment gateway API...')

      const gatewayResponse = await fetch(PAYMENT_API_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${encodedAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      })

      if (!gatewayResponse.ok) {
        const errorData = await gatewayResponse.json()
        console.error('Gateway API error:', errorData)

        // Update transaction with gateway error
        await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'failed',
            error_message: errorData.message || 'Payment gateway error',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentTransaction.id)

        throw new Error(`Payment gateway error: ${errorData.message || gatewayResponse.statusText}`)
      }

      const gatewayData = await gatewayResponse.json()
      console.log('Gateway response:', gatewayData)

      gatewayTransactionId = gatewayData.transactionId
      upiString = gatewayData.upiString

      // Update transaction with gateway response
      const { error: updateError } = await supabaseClient
        .from('payment_transactions')
        .update({
          gateway_transaction_id: gatewayTransactionId,
          upi_string: upiString,
          gateway_status: 'CREATED',
          updated_at: new Date().toISOString(),
          gateway_response: gatewayData
        })
        .eq('id', paymentTransaction.id)

      if (updateError) {
        console.error('Failed to update payment transaction:', updateError)
      }

      console.log('✅ Real gateway payment created')
    } else {
      console.log('Using fallback UPI payment...')

      const amountRupees = amountPaisa / 100
      const payee = 'test@upi' // Fallback UPI ID for testing
      const payeeName = encodeURIComponent('NP Wellness')
      const note = encodeURIComponent(`Order ${gatewayOrderId}`)
      upiString = `upi://pay?pa=${payee}&pn=${payeeName}&am=${amountRupees.toFixed(2)}&cu=INR&tn=${note}`

      // Update transaction with fallback
      const { error: fallbackUpdateError } = await supabaseClient
        .from('payment_transactions')
        .update({
          upi_string: upiString,
          gateway_status: 'CREATED',
          updated_at: new Date().toISOString(),
          gateway_response: { mode: 'fallback' }
        })
        .eq('id', paymentTransaction.id)

      if (fallbackUpdateError) {
        console.error('Failed to update payment transaction during fallback:', fallbackUpdateError)
      }

      console.log('✅ Fallback UPI payment created')
    }

    // Update order with payment transaction ID
    await supabaseClient
      .from('orders')
      .update({
        payment_transaction_id: paymentTransaction.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    const response = {
      success: true,
      data: {
        paymentId: paymentTransaction.id,
        transactionId: gatewayTransactionId ?? paymentTransaction.id,
        gatewayOrderId,
        upiString,
        amount: amountPaisa / 100,
        currency: 'INR',
        expiresAt: expiresAt.toISOString(),
        status: 'pending'
      }
    }

    console.log('✅ Real payment created successfully:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Payment creation error:', error)
    console.error('Error stack:', error.stack)

    const errorResponse = {
      success: false,
      error: error.message || 'Failed to create payment',
      details: {
        type: error.name,
        stack: error.stack?.substring(0, 300)
      }
    }

    console.log('❌ Error response:', errorResponse)

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})