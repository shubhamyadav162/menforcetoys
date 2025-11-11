import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from "https://deno.land/std@0.131.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Accept, Origin'
}

// Payment Gateway API Configuration
const PAYMENT_API_URL = 'https://api.toys4peace.workers.dev/transaction'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    const clientOptions = authHeader && !SUPABASE_SERVICE_ROLE_KEY
      ? {
        global: {
          headers: { Authorization: authHeader }
        }
      }
      : undefined

    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      clientOptions
    )

    // Parse request body
    const { orderId, amountPaisa, callbackUrl } = await req.json()

    if (!orderId || !amountPaisa || !callbackUrl) {
      throw new Error('Missing required fields: orderId, amountPaisa, callbackUrl')
    }

    if (amountPaisa < 100) {
      throw new Error('Amount must be at least 100 paisa (₹1.00)')
    }

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, user_id, total_amount, status, payment_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Check if payment already exists for this order
    const { data: existingPayment } = await supabaseClient
      .from('payment_transactions')
      .select('id, status')
      .eq('order_id', orderId)
      .eq('status', 'completed')
      .single()

    if (existingPayment) {
      throw new Error('Payment already completed for this order')
    }

    // Get merchant configuration
    const { data: merchantConfig } = await supabaseClient
      .from('merchant_config')
      .select('*')
      .eq('gateway', 'toys4peace')
      .eq('is_active', true)
      .single()

    // Get merchant credentials from environment variables or secrets
    const merchantId = Deno.env.get('TOYS4PEACE_MERCHANT_ID')
    const secretKey = Deno.env.get('TOYS4PEACE_SECRET_KEY')

    const useGateway = Boolean(merchantConfig && merchantId && secretKey && PAYMENT_API_URL)

    // Create gateway order ID
    const gatewayOrderId = `NP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create payment transaction record
    const expiresAt = new Date(Date.now() + (180 * 1000)) // 180 seconds

    const { data: paymentTransaction, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        amount: amountPaisa / 100, // Convert to rupees
        currency: 'INR',
        gateway: 'toys4peace',
        gateway_order_id: gatewayOrderId,
        status: 'pending',
        callback_url: callbackUrl,
        expires_at: expiresAt.toISOString(),
        payment_method: {
          type: 'upi',
          gateway: 'toys4peace'
        }
      })
      .select()
      .single()

    if (paymentError || !paymentTransaction) {
      throw new Error('Failed to create payment transaction record')
    }

    let gatewayTransactionId: string | undefined
    let upiString: string

    if (useGateway) {
      const paymentRequest = {
        amountPaisa,
        orderId: gatewayOrderId,
        callbackUrl: `${callbackUrl}?transaction_id=${paymentTransaction.id}`
      }

      const authString = `${merchantId}:${secretKey}`
      const encodedAuth = btoa(authString)

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
      gatewayTransactionId = gatewayData.transactionId
      upiString = gatewayData.upiString

      const { error: updateError } = await supabaseClient
        .from('payment_transactions')
        .update({
          gateway_transaction_id: gatewayTransactionId,
          upi_string: upiString,
          gateway_status: 'CREATED',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentTransaction.id)

      if (updateError) {
        console.error('Failed to update payment transaction:', updateError)
      }
    } else {
      const amountRupees = amountPaisa / 100
      const payee = merchantConfig?.config?.upi_id ?? 'test@upi'
      const payeeName = encodeURIComponent(merchantConfig?.config?.merchant_name ?? 'NP Wellness')
      const note = encodeURIComponent(`Order ${gatewayOrderId}`)
      upiString = `upi://pay?pa=${payee}&pn=${payeeName}&am=${amountRupees.toFixed(2)}&cu=INR&tn=${note}`

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

    return new Response(
      JSON.stringify({
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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Payment creation error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Helper function to validate webhook signature (if needed)
async function validateWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await createHash('SHA-256')
    .update(payload + secret)
    .digest('hex')

  return signature === expectedSignature
}