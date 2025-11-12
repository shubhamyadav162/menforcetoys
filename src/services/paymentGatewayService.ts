// Payment Gateway Service for NP Wellness Store
import { supabase } from '@/lib/supabase';
import PaymentDebugger from '@/utils/paymentDebugger';

export interface PaymentRequest {
  orderId: string;
  amount: number; // in rupees
  callbackUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentId: string;
    transactionId: string;
    gatewayOrderId: string;
    upiString: string;
    amount: number;
    currency: string;
    expiresAt: string;
    status: string;
  };
  error?: string;
}

export interface PaymentStatus {
  success: boolean;
  data?: {
    paymentId: string;
    orderId: string;
    gatewayOrderId: string;
    gatewayTransactionId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    gatewayStatus: string;
    upiString: string;
    vpaId?: string;
    bankRef?: string;
    createdAt: string;
    expiresAt: string;
    completedAt?: string;
    timeRemaining?: number;
    isExpired: boolean;
    gatewayInfo?: {
      status: string;
      vpa_id?: string;
      ref_id?: string;
      createdAt: string;
    };
    order: {
      id: string;
      status: string;
      paymentStatus: string;
      totalAmount: number;
    };
  };
  error?: string;
}

export class PaymentGatewayService {
  // Create a new payment transaction
  static async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    PaymentDebugger.logPaymentFlow('createPayment called', request);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Convert rupees to paisa
      const amountPaisa = Math.round(request.amount * 100);

      // Set frontend redirect URL (where user returns after payment)
      const callbackUrl = request.callbackUrl ||
        `${window.location.origin}/order-success`;

      const authHeaders = session
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined;

      const functionHeaders = {
        ...authHeaders,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const requestBody = {
        orderId: request.orderId,
        amountPaisa,
        frontendRedirectUrl: callbackUrl
      };

      PaymentDebugger.logPaymentFlow('Calling create-payment edge function', { requestBody, headers: functionHeaders });

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: JSON.stringify(requestBody),
        headers: functionHeaders
      });

      PaymentDebugger.logEdgeFunctionCall('create-payment', requestBody, { data, error });

      if (error) {
        PaymentDebugger.logError('create-payment edge function', error);

        // Extract detailed error information if available
        let errorMessage = error.message || 'Failed to create payment';
        if (error.details) {
          console.error('Detailed error information:', error.details);
          errorMessage += ` (${error.details.type || 'Unknown'})`;
        }

        throw new Error(errorMessage);
      }

      PaymentDebugger.logPaymentFlow('create-payment successful', data);
      return data;
    } catch (error) {
      PaymentDebugger.logError('createPayment service error', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }
  }

  // Check payment status
  static async checkPaymentStatus(paymentId: string, orderId?: string): Promise<PaymentStatus> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const params = new URLSearchParams();
      if (paymentId) params.append('paymentId', paymentId);
      if (orderId) params.append('orderId', orderId);

      const authHeaders = session
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined;

      const functionHeaders = {
        ...authHeaders,
        'Accept': 'application/json'
      };

      const functionPath = params.toString()
        ? `check-payment-status?${params.toString()}`
        : 'check-payment-status';

      const { data, error } = await supabase.functions.invoke(functionPath, {
        headers: functionHeaders,
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to check payment status');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cancel payment
  static async cancelPayment(paymentId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const authHeaders = session
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined;

      const functionHeaders = {
        ...authHeaders,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const { data, error } = await supabase.functions.invoke('cancel-payment', {
        body: {
          paymentId,
          reason
        },
        headers: functionHeaders
      });

      if (error) {
        throw new Error(error.message || 'Failed to cancel payment');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Subscribe to real-time payment status updates
  static subscribeToPaymentUpdates(
    orderId: string,
    callback: (payload: any) => void
  ) {
    const channelName = `payment_status_${orderId}`;

    return supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'payment_status_update' },
        callback
      )
      .subscribe();
  }

  // Unsubscribe from payment updates
  static unsubscribeFromPaymentUpdates(subscription: any) {
    return supabase.removeChannel(subscription);
  }

  // Format payment status for display
  static formatPaymentStatus(status: string): { text: string; color: string; icon: string } {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          text: 'Payment Pending',
          color: 'yellow',
          icon: '⏳'
        };
      case 'completed':
      case 'paid':
        return {
          text: 'Payment Successful',
          color: 'green',
          icon: '✅'
        };
      case 'failed':
        return {
          text: 'Payment Failed',
          color: 'red',
          icon: '❌'
        };
      case 'cancelled':
        return {
          text: 'Payment Cancelled',
          color: 'gray',
          icon: '🚫'
        };
      default:
        return {
          text: 'Unknown Status',
          color: 'gray',
          icon: '❓'
        };
    }
  }

  // Format amount in rupees
  static formatAmount(amountInRupees: number): string {
    return `₹${amountInRupees.toFixed(2)}`;
  }

  // Format time remaining
  static formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Expired';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${seconds}s`;
    }
  }

  // Generate UPI payment URL
  static generateUpiPaymentUrl(upiString: string): string {
    try {
      // Ensure the UPI string is properly formatted
      if (upiString.startsWith('upi://')) {
        return upiString;
      }
      throw new Error('Invalid UPI string format');
    } catch (error) {
      console.error('Error generating UPI URL:', error);
      return '#';
    }
  }

  // Copy UPI string to clipboard
  static async copyUpiToClipboard(upiString: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(upiString);
      return true;
    } catch (error) {
      console.error('Failed to copy UPI string:', error);
      return false;
    }
  }

  // Share UPI payment details
  static async sharePaymentDetails(payment: {
    amount: number;
    upiString: string;
    transactionId: string;
  }): Promise<boolean> {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Payment for NP Wellness Store',
          text: `Amount: ${this.formatAmount(payment.amount)}\nTransaction ID: ${payment.transactionId}\nUPI: ${payment.upiString}`,
          url: payment.upiString
        });
        return true;
      } else {
        // Fallback: copy to clipboard
        const text = `Amount: ${this.formatAmount(payment.amount)}\nTransaction ID: ${payment.transactionId}\nUPI: ${payment.upiString}`;
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.error('Failed to share payment details:', error);
      return false;
    }
  }

  // Validate payment amount
  static validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: 'Invalid amount' };
    }
    if (amount < 1) {
      return { isValid: false, error: 'Minimum amount is ₹1.00' };
    }
    if (amount > 100000) {
      return { isValid: false, error: 'Maximum amount is ₹100,000' };
    }
    return { isValid: true };
  }
}

// Utility class for payment polling
export class PaymentStatusPoller {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor(
    private paymentId: string,
    private callback: (status: PaymentStatus) => void,
    private intervalMs: number = 3000 // Poll every 3 seconds
  ) {}

  start(): void {
    if (this.isActive) return;

    this.isActive = true;

    // Check immediately
    this.checkStatus();

    // Set up polling
    this.intervalId = setInterval(() => {
      this.checkStatus();
    }, this.intervalMs);
  }

  stop(): void {
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkStatus(): Promise<void> {
    if (!this.isActive) return;

    try {
      const status = await PaymentGatewayService.checkPaymentStatus(this.paymentId);
      this.callback(status);

      // Stop polling if payment is completed/failed/cancelled
      if (status.data?.status && ['completed', 'failed', 'cancelled'].includes(status.data.status)) {
        this.stop();
      }
    } catch (error) {
      console.error('Payment status check failed:', error);
    }
  }
}

export default PaymentGatewayService;