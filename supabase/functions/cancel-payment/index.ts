import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Accept, Origin'
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

    // Parse request body
    const { paymentId, reason } = await req.json()

    if (!paymentId) {
      throw new Error('paymentId is required')
    }

    // Get payment transaction
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .select(`
        *,
        orders!inner(
          id,
          user_id,
          status,
          payment_status
        )
      `)
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      throw new Error('Payment transaction not found')
    }

    // Check if the user has access to this payment
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user || payment.orders.user_id !== user.id) {
      throw new Error('Access denied')
    }

    // Check if payment can be cancelled
    if (payment.status !== 'pending') {
      throw new Error('Payment cannot be cancelled. Current status: ' + payment.status)
    }

    // Check if payment has expired
    const isExpired = payment.expires_at && new Date(payment.expires_at) < new Date()
    if (isExpired) {
      // Just update status to cancelled if already expired
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'cancelled',
          gateway_status: 'EXPIRED',
          updated_at: new Date().toISOString(),
          callback_data: {
            reason: reason || 'user_cancelled_after_expiry',
            cancelled_by: 'user'
          }
        })
        .eq('id', paymentId)

      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.order_id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment cancelled (was already expired)',
          data: {
            paymentId,
            status: 'cancelled',
            reason: 'expired'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Update payment transaction status to cancelled
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status: 'cancelled',
        gateway_status: 'CANCELLED',
        updated_at: new Date().toISOString(),
        callback_data: {
          reason: reason || 'user_cancelled',
          cancelled_by: 'user',
          cancelled_at: new Date().toISOString()
        }
      })
      .eq('id', paymentId)

    if (updateError) {
      throw new Error('Failed to cancel payment transaction')
    }

    // Update order status
    await supabaseClient
      .from('orders')
      .update({
        payment_status: 'cancelled',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.order_id)

    // Send real-time notification
    const channelName = `payment_status_${payment.order_id}`
    supabaseClient
      .channel(channelName)
      .send({
        type: 'broadcast',
        event: 'payment_status_update',
        payload: {
          orderId: payment.order_id,
          paymentId,
          paymentStatus: 'cancelled',
          orderStatus: 'cancelled',
          status: 'CANCELLED',
          reason: reason || 'user_cancelled',
          timestamp: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment cancelled successfully',
        data: {
          paymentId,
          orderId: payment.order_id,
          status: 'cancelled',
          reason: reason || 'user_cancelled'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Payment cancellation error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to cancel payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})