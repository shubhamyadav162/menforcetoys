import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role key for webhooks
    )

    // Log the incoming webhook
    const webhookData = await req.json()
    console.log('Payment webhook received:', webhookData)

    // Log webhook payload for debugging
    await supabaseClient
      .from('payment_webhook_logs')
      .insert({
        gateway: 'toys4peace',
        gateway_transaction_id: webhookData.transactionId,
        payload: webhookData,
        processed: false
      })

    // Validate webhook data
    if (!webhookData.status || !webhookData.orderId || !webhookData.transactionId) {
      throw new Error('Invalid webhook payload: missing required fields')
    }

    const { status, orderId, transactionId, amount, vpaId, bank_ref } = webhookData

    // Find the payment transaction by gateway transaction ID
    const { data: paymentTransaction, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .select('*, orders!inner(id, user_id, total_amount, status)')
      .eq('gateway_transaction_id', transactionId)
      .single()

    if (paymentError || !paymentTransaction) {
      console.error('Payment transaction not found for transactionId:', transactionId)
      throw new Error('Payment transaction not found')
    }

    // Update webhook log
    await supabaseClient
      .from('payment_webhook_logs')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('gateway_transaction_id', transactionId)
      .eq('processed', false)

    // Prepare update data
    const updateData: any = {
      status: status.toLowerCase() === 'completed' ? 'completed' :
              status.toLowerCase() === 'cancelled' ? 'cancelled' : 'failed',
      gateway_status: status,
      callback_delivered: true,
      callback_data: webhookData,
      callback_ts: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (vpaId) updateData.vpa_id = vpaId
    if (bank_ref) updateData.bank_ref = bank_ref
    if (status.toLowerCase() === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    // Update payment transaction
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update(updateData)
      .eq('id', paymentTransaction.id)

    if (updateError) {
      console.error('Failed to update payment transaction:', updateError)
      throw new Error('Failed to update payment transaction')
    }

    // Update order status based on payment status
    const orderUpdateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status.toLowerCase() === 'completed') {
      orderUpdateData.payment_status = 'paid'
      orderUpdateData.status = 'confirmed'

      // Create payment transaction record for order
      await supabaseClient
        .from('payment_transactions')
        .insert({
          order_id: paymentTransaction.orders.id,
          transaction_id: `ORDER-${paymentTransaction.orders.id}`,
          gateway: 'toys4peace',
          amount: paymentTransaction.amount,
          currency: paymentTransaction.currency,
          status: 'completed',
          payment_method: paymentTransaction.payment_method,
          created_at: new Date().toISOString()
        })

    } else if (status.toLowerCase() === 'cancelled') {
      orderUpdateData.payment_status = 'cancelled'
    } else {
      orderUpdateData.payment_status = 'failed'
    }

    await supabaseClient
      .from('orders')
      .update(orderUpdateData)
      .eq('id', paymentTransaction.orders.id)

    // Send real-time notification to client
    const channelName = `payment_status_${paymentTransaction.orders.id}`
    supabaseClient
      .channel(channelName)
      .send({
        type: 'broadcast',
        event: 'payment_status_update',
        payload: {
          orderId: paymentTransaction.orders.id,
          paymentStatus: orderUpdateData.payment_status,
          orderStatus: orderUpdateData.status,
          transactionId,
          gatewayTransactionId: paymentTransaction.gateway_transaction_id,
          status,
          amount,
          vpaId,
          bank_ref,
          timestamp: new Date().toISOString()
        }
      })

    console.log('Payment webhook processed successfully:', {
      transactionId,
      status,
      orderId: paymentTransaction.orders.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Payment webhook error:', error)

    // Log webhook error
    try {
      await supabaseClient
        .from('payment_webhook_logs')
        .update({
          processed: false,
          processing_error: error.message
        })
        .eq('gateway', 'toys4peace')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(1)
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process webhook'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})