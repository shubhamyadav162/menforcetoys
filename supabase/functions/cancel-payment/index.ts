// AcceptPay Cancel Payment for MenForceToys
// This edge function cancels a pending payment

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  console.log('=== AcceptPay Cancel Payment ===')

  try {
    // Parse request body
    const body = await req.json()
    const { transactionId, orderId, orderNumber, reason } = body

    console.log('📋 Cancel request:', { transactionId, orderId, orderNumber, reason })

    if (!transactionId && !orderId && !orderNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Either transactionId, orderId, or orderNumber is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client with service role for admin access
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find the payment transaction or order
    let paymentTxn = null
    let order = null

    if (transactionId) {
      const { data } = await supabaseClient
        .from('payment_transactions')
        .select('*, order_id')
        .eq('transaction_id', transactionId)
        .maybeSingle()
      paymentTxn = data
    }

    if (orderId && !paymentTxn) {
      const { data } = await supabaseClient
        .from('payment_transactions')
        .select('*, order_id')
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
          .select('*, order_id')
          .eq('order_id', orderData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        paymentTxn = data
      }
    }

    // Get order if not already fetched
    if (paymentTxn && paymentTxn.order_id && !order) {
      const { data } = await supabaseClient
        .from('orders')
        .select('id, order_number, status, payment_status')
        .eq('id', paymentTxn.order_id)
        .maybeSingle()
      order = data
    }

    // Check if payment can be cancelled
    if (paymentTxn && paymentTxn.status !== 'pending') {
      console.log('⚠️ Payment cannot be cancelled, status:', paymentTxn.status)
      return new Response(JSON.stringify({
        success: false,
        error: `Payment cannot be cancelled. Current status: ${paymentTxn.status}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const cancelReason = reason || 'user_cancelled'
    const now = new Date().toISOString()

    // Update payment transaction
    if (paymentTxn) {
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'cancelled',
          failure_reason: cancelReason,
          updated_at: now,
          gateway_response: {
            cancelled: true,
            reason: cancelReason,
            cancelled_at: now
          }
        })
        .eq('id', paymentTxn.id)

      console.log('✅ Payment transaction cancelled:', paymentTxn.id)
    }

    // Update order
    const orderIdToUpdate = order?.id || paymentTxn?.order_id
    if (orderIdToUpdate) {
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'cancelled',
          status: 'cancelled',
          updated_at: now
        })
        .eq('id', orderIdToUpdate)

      console.log('✅ Order cancelled:', orderIdToUpdate)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment cancelled successfully',
      data: {
        transactionId: paymentTxn?.transaction_id || transactionId,
        orderId: orderIdToUpdate,
        orderNumber: order?.order_number || orderNumber,
        status: 'cancelled',
        reason: cancelReason,
        cancelledAt: now
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Cancel payment error:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to cancel payment'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})