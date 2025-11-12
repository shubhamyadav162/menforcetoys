// Enhanced order service for NP Wellness Store with real-time capabilities
import { supabase } from '@/lib/supabase';
import type { Order, OrderInsert, PaymentTransaction } from '@/types/database';
import type { ShippingAddressForm } from '@/utils/formValidation';
import { ShippingAddressService } from './shippingAddressService';
import PaymentGatewayService from './paymentGatewayService';

export interface OrderRequest {
  product: {
    id: string;
    name: { en: string; hi: string };
    price: number;
  };
  quantity: number;
  shippingAddress: ShippingAddressForm;
  userId?: string;
  saveAddress?: boolean;
  isDefaultAddress?: boolean;
}

export interface OrderResponse {
  success: boolean;
  data?: Order;
  error?: string;
  orderNumber?: string;
}

export interface PaymentOrderResponse extends OrderResponse {
  requiresPayment: boolean;
  paymentId?: string;
  upiString?: string;
  amount?: number;
}

export class OrderService {
  // Create a new order with enhanced validation and real-time processing
  static async createOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    try {
      const { product, quantity, shippingAddress, userId, saveAddress, isDefaultAddress } = orderRequest;

      // Calculate order totals
      const subtotal = product.price * quantity;
      const shippingCost = 50; // Fixed shipping cost
      const totalAmount = subtotal + shippingCost;

      // Generate unique order number
      const orderNumber = await this.generateOrderNumber();

      // Prepare shipping address object for database
      const shippingAddressDB = {
        address_line_1: shippingAddress.address,
        address_line_2: shippingAddress.addressLine2,
        landmark: shippingAddress.landmark,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: 'India'
      };

      // Prepare order data
      const orderData: OrderInsert = {
        user_id: userId,
        full_name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: undefined, // Can be added later
        shipping_address: shippingAddressDB,
        subtotal: Math.round(subtotal * 100), // Convert to paise
        shipping_cost: Math.round(shippingCost * 100),
        tax_amount: 0,
        discount_amount: 0,
        total_amount: Math.round(totalAmount * 100),
        status: 'pending',
        payment_status: 'pending',
        payment_method: {
          type: 'upi' as const
        },
        shipping_method: {
          type: 'standard' as const,
          name: 'Standard Delivery',
          days: '3-5',
          cost: shippingCost
        }
      };

      // Start a transaction-like operation
      const operations = [];

      // 1. Create the order
      const orderPromise = supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      operations.push(orderPromise);

      // 2. Save shipping address if requested and user is logged in
      if (userId && saveAddress) {
        const addressPromise = ShippingAddressService.createShippingAddress(
          userId,
          shippingAddress,
          isDefaultAddress || false
        );
        operations.push(addressPromise);
      }

      // Execute all operations
      const results = await Promise.allSettled(operations);

      // Check if order creation was successful
      const orderResult = results[0];
      if (orderResult.status === 'rejected') {
        throw new Error('Failed to create order');
      }

      const { data: order, error: orderError } = orderResult.value;
      if (orderError || !order) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Check if address saving was requested but failed
      if (userId && saveAddress && results[1]) {
        const addressResult = results[1];
        if (addressResult.status === 'rejected' || !addressResult.value?.success) {
          console.warn('Address saving failed, but order was created:', addressResult);
          // Don't fail the order, just log the warning
        }
      }

      // Create order item record
      await this.createOrderItem(order.id, product, quantity);

      return {
        success: true,
        data: order,
        orderNumber: orderNumber
      };

    } catch (error) {
      console.error('Order creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order'
      };
    }
  }

  // Create order and initiate payment (new method)
  static async createOrderWithPayment(orderRequest: OrderRequest): Promise<PaymentOrderResponse> {
    try {
      // First, create the order
      const orderResponse = await this.createOrder(orderRequest);

      if (!orderResponse.success || !orderResponse.data) {
        return {
          ...orderResponse,
          requiresPayment: false
        };
      }

      // Calculate total amount for payment
      const { product, quantity } = orderRequest;
      const subtotal = product.price * quantity;
      const shippingCost = 50; // Fixed shipping cost
      const totalAmount = subtotal + shippingCost;

      // Create payment transaction
      const paymentResponse = await PaymentGatewayService.createPayment({
        orderId: orderResponse.data.id,
        amount: totalAmount
      });

      console.log('Payment response received:', paymentResponse);

      if (paymentResponse.success && paymentResponse.data) {
        console.log('Payment successful, setting up payment flow');
        console.log('Payment ID:', paymentResponse.data.paymentId);
        console.log('UPI String:', paymentResponse.data.upiString);

        return {
          success: true,
          data: orderResponse.data,
          orderNumber: orderResponse.orderNumber,
          requiresPayment: true,
          paymentId: paymentResponse.data.paymentId,
          upiString: paymentResponse.data.upiString,
          amount: totalAmount,
          paymentData: paymentResponse.data
        };
      } else {
        // Payment creation failed, but order was created
        // Mark order as payment failed
        await this.updateOrderStatus(orderResponse.data.id, 'pending', 'failed');

        return {
          success: false,
          error: paymentResponse.error || 'Failed to create payment transaction',
          requiresPayment: false
        };
      }

    } catch (error) {
      console.error('Order and payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order and payment',
        requiresPayment: false
      };
    }
  }

  // Create order item (helper method)
  private static async createOrderItem(
    orderId: string,
    product: { id: string; name: { en: string; hi: string }; price: number },
    quantity: number
  ) {
    try {
      const orderItemData = {
        order_id: orderId,
        product_id: product.id,
        sku: `PROD-${product.id}`,
        product_name: product.name,
        quantity: quantity,
        unit_price: Math.round(product.price * 100), // Convert to paise
        total_price: Math.round(product.price * quantity * 100), // Convert to paise
        product_snapshot: {
          name: product.name,
          price: product.price
        },
        status: 'pending'
      };

      const { error } = await supabase
        .from('order_items')
        .insert([orderItemData]);

      if (error) {
        console.error('Error creating order item:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Order item creation error:', error);
      throw error;
    }
  }

  // Generate unique order number
  private static async generateOrderNumber(): Promise<string> {
    try {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `NP-${datePart}-${randomPart}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback to timestamp-based number
      return `NP-${Date.now().toString(36).toUpperCase()}`;
    }
  }

  // Get order by ID with enhanced details
  static async getOrderById(orderId: string, userId?: string) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(id, name, image_url)),
          payment_transactions:payment_transactions(*)
        `)
        .eq('id', orderId);

      // If userId is provided, ensure user can only access their own orders
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching order:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fetch order error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order'
      };
    }
  }

  // Get orders for a user with pagination
  static async getUserOrders(
    userId: string,
    options: {
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(id, product_id, quantity, unit_price, total_price),
          payment_transactions(id, status, gateway_transaction_id, vpa_id, bank_ref)
        `)
        .eq('user_id', userId);

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(options.limit || 10)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 10) - 1);

      if (error) {
        console.error('Error fetching user orders:', error);
        throw new Error(error.message);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Fetch user orders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders'
      };
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    paymentStatus?: Order['payment_status'],
    trackingNumber?: string
  ) {
    try {
      const updateData: Partial<Order> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating order status:', error);
        throw new Error(error.message);
      }

      if (!data) {
        return { success: true, data: undefined as unknown as Order };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Update order status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status'
      };
    }
  }

  // Get payment status for an order
  static async getOrderPaymentStatus(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching payment status:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fetch payment status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment status'
      };
    }
  }

  // Cancel order with payment
  static async cancelOrder(orderId: string, userId: string, reason?: string) {
    try {
      // Check if order exists and belongs to user
      const { data: order, error: orderError } = await this.getOrderById(orderId, userId);

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (order.status === 'shipped' || order.status === 'delivered') {
        throw new Error('Order cannot be cancelled in current status');
      }

      // Cancel any pending payment
      if (order.payment_status === 'pending') {
        const { data: payment } = await this.getOrderPaymentStatus(orderId);
        if (payment && payment.status === 'pending') {
          await PaymentGatewayService.cancelPayment(payment.id, reason || 'Order cancelled by user');
        }
      }

      // Update order status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: order.payment_status === 'paid' ? 'refunded' : 'cancelled',
          updated_at: new Date().toISOString(),
          internal_notes: {
            ...order.internal_notes,
            cancelled_by: 'user',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason
          }
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return { success: true, data: updatedOrder };
    } catch (error) {
      console.error('Order cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order'
      };
    }
  }

  // Create payment transaction with gateway data
  static async createPaymentTransaction(
    orderId: string,
    transactionData: {
      transactionId: string;
      gateway: string;
      amount: number;
      status: PaymentTransaction['status'];
      paymentMethod: PaymentTransaction['payment_method'];
      gatewayResponse?: Record<string, any>;
    }
  ) {
    try {
      const paymentData = {
        order_id: orderId,
        transaction_id: transactionData.transactionId,
        gateway: transactionData.gateway,
        amount: Math.round(transactionData.amount * 100), // Convert to paise
        currency: 'INR',
        status: transactionData.status,
        payment_method: transactionData.paymentMethod,
        gateway_response: transactionData.gatewayResponse || {}
      };

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment transaction:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Payment transaction creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment transaction'
      };
    }
  }

  // Real-time subscription for order updates
  static subscribeToOrderUpdates(
    orderId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`order_${orderId}_updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  }

  // Real-time subscription for user orders
  static subscribeToUserOrders(
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`user_${userId}_orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}