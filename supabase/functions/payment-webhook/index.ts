// AcceptPay Payment Webhook Handler for MenForceToys
// This edge function receives webhooks from AcceptPay when payment status changes

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Initialize Supabase client with service role key for admin access
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Parse webhook payload from AcceptPay
    const webhookData = await req.json()
    console.log('📥 AcceptPay webhook received:', JSON.stringify(webhookData, null, 2))

    // AcceptPay webhook payload structure:
    // {
    //   "event": "payment.completed" | "payment.failed" | "payment.cancelled",
    //   "data": {
    //     "transactionId": "694xxx...",
    //     "status": "COMPLETED" | "FAILED" | "TIMEOUT",
    //     "amount": 500,
    //     "billId": "NP-XXXXX-XXXX",
    //     "customerPhone": "9876543210",
    //     "completedAt": "2024-12-25T10:30:00.000Z"
    //   }
    // }

    const event = webhookData.event || 'payment.update'
    const data = webhookData.data || webhookData

    // Extract key fields
    const transactionId = data.transactionId || data._id
    const status = data.status
    const billId = data.billId || data.orderId // billId is the order_number
    const amount = data.amount
    const vpaId = data.vpaId
    const bankRef = data.bank_ref || data.bankRef

    console.log('📋 Parsed webhook data:', { event, transactionId, status, billId, amount })

    if (!transactionId || !status) {
      console.error('❌ Missing required fields: transactionId or status')
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: transactionId and status are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Map AcceptPay status to our status values
    let paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded' = 'pending'
    let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' = 'pending'

    const statusLower = status.toLowerCase()
    if (statusLower === 'completed' || statusLower === 'success') {
      paymentStatus = 'success'
      orderStatus = 'confirmed'
    } else if (statusLower === 'failed') {
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
    } else if (statusLower === 'timeout' || statusLower === 'expired') {
      paymentStatus = 'cancelled'
      orderStatus = 'cancelled'
    } else if (statusLower === 'cancelled') {
      paymentStatus = 'cancelled'
      orderStatus = 'cancelled'
    }

    console.log('🔄 Status mapping:', { original: status, paymentStatus, orderStatus })

    // Try to find the payment transaction by transaction_id
    let paymentTxn = null
    const { data: existingTxn, error: txnError } = await supabaseClient
      .from('payment_transactions')
      .select('*, order_id')
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (existingTxn) {
      paymentTxn = existingTxn
      console.log('✅ Found payment transaction:', existingTxn.id)
    } else {
      console.log('⚠️ Payment transaction not found, looking for order by billId:', billId)
    }

    // If we have a payment transaction, update it
    if (paymentTxn) {
      const updateData: Record<string, any> = {
        status: paymentStatus,
        updated_at: new Date().toISOString(),
        gateway_response: webhookData
      }

      if (vpaId) updateData.vpa_id = vpaId
      if (bankRef) updateData.bank_ref = bankRef
      if (paymentStatus === 'success') {
        updateData.processed_at = new Date().toISOString()
      }

      const { error: updateTxnError } = await supabaseClient
        .from('payment_transactions')
        .update(updateData)
        .eq('id', paymentTxn.id)

      if (updateTxnError) {
        console.error('❌ Error updating payment transaction:', updateTxnError)
      } else {
        console.log('✅ Payment transaction updated')
      }

      // Update the order
      if (paymentTxn.order_id) {
        const orderUpdateData: Record<string, any> = {
          payment_status: paymentStatus === 'success' ? 'paid' : paymentStatus,
          status: orderStatus,
          updated_at: new Date().toISOString()
        }

        const { error: orderUpdateError } = await supabaseClient
          .from('orders')
          .update(orderUpdateData)
          .eq('id', paymentTxn.order_id)

        if (orderUpdateError) {
          console.error('❌ Error updating order:', orderUpdateError)
        } else {
          console.log('✅ Order updated:', paymentTxn.order_id)
        }
      }
    } else if (billId) {
      // Try to find order by order_number (billId)
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('order_number', billId)
        .maybeSingle()

      if (order) {
        console.log('✅ Found order by billId:', order.id)

        // Create payment transaction record if it doesn't exist
        const { error: insertTxnError } = await supabaseClient
          .from('payment_transactions')
          .insert({
            order_id: order.id,
            transaction_id: transactionId,
            gateway: 'acceptpay',
            amount: Math.round((amount || 0) * 100), // Convert to paise
            currency: 'INR',
            status: paymentStatus,
            payment_method: { type: 'upi' },
            gateway_response: webhookData,
            vpa_id: vpaId,
            bank_ref: bankRef,
            processed_at: paymentStatus === 'success' ? new Date().toISOString() : null
          })
          .select()
          .single()

        if (insertTxnError) {
          console.error('⚠️ Error inserting payment transaction:', insertTxnError)
        } else {
          console.log('✅ Payment transaction created')
        }

        // Update order status
        const { error: orderUpdateError } = await supabaseClient
          .from('orders')
          .update({
            payment_status: paymentStatus === 'success' ? 'paid' : paymentStatus,
            status: orderStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (orderUpdateError) {
          console.error('❌ Error updating order:', orderUpdateError)
        } else {
          console.log('✅ Order updated')
        }
      } else {
        console.log('⚠️ Order not found for billId:', billId)
      }
    }

    console.log('✅ Webhook processed successfully')

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      transactionId,
      status: paymentStatus
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})