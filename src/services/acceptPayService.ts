// AcceptPay Payment Gateway Service for NP Wellness Store
// API Documentation: https://acceptpay.publicvm.com
// CORRECT: Credentials go in request BODY, NOT Authorization header!

const ACCEPTPAY_API_URL = import.meta.env.VITE_ACCEPTPAY_API_URL || 'https://acceptpay.publicvm.com';
const ACCEPTPAY_API_KEY = import.meta.env.VITE_ACCEPTPAY_API_KEY || '';
const ACCEPTPAY_API_SECRET = import.meta.env.VITE_ACCEPTPAY_API_SECRET || '';

export interface CreatePaymentRequest {
  amount: number; // Amount in INR (minimum: 1)
  mobile: string; // Customer's 10-digit mobile number
  email?: string; // Customer's email address
  billId?: string; // Your unique order/invoice ID
  description?: string; // Payment description shown to customer
  customerName?: string; // Customer name
}

export interface PaymentResponse {
  status: 'success' | 'fail';
  code?: number;
  message: string;
  data: {
    transactionId: string;
    paymentLink: string;
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed' | 'refunded' | 'initiated';
    expiresAt: string;
  };
}

export interface TransactionStatusResponse {
  status: 'success' | 'fail';
  result?: {
    _id: string;
    status: 'initiated' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
    amount: number;
    vpaId?: string;
    paidAt?: string;
  };
  data?: {
    transactionId: string;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    paymentMethod?: string;
    paidAt?: string;
    billId?: string;
    gatewayPaymentId?: string;
  };
}

export interface QRCodeResponse {
  status: 'success' | 'fail';
  result?: {
    upiString: string;
    razorpayQrId: string;
  };
  message?: string;
}

export interface TransactionListResponse {
  status: 'success' | 'fail';
  data: {
    transactions: Array<{
      transactionId: string;
      amount: number;
      status: string;
      createdAt: string;
      billId?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export class AcceptPayService {
  // NO Authorization header - credentials go in request body only!
  private static getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new payment transaction
   * CORRECT ENDPOINT: POST /api/v1/transaction/initiate-transaction
   * CORRECT AUTH: apiKey + apiSecret in request body (NOT Authorization header!)
   */
  static async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🔄 Creating AcceptPay payment:', request);
      console.log('📍 Endpoint: /api/v1/transaction/initiate-transaction');
      console.log('🔑 Using API Key:', ACCEPTPAY_API_KEY.substring(0, 8) + '...');

      // Construct URLs for AcceptPay
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

      // Return URL - where customer is redirected after payment
      // Template variables: {{transactionId}}, {{status}}, {{amount}}, {{billId}}
      const returnUrl = `${currentOrigin}/payment-success?txn={{transactionId}}&status={{status}}&order={{billId}}`;

      // Webhook URL - server-to-server notification (Supabase Edge Function)
      const webhookUrl = 'https://qnvdzuiimikcrgpjfier.supabase.co/functions/v1/payment-webhook';

      const requestBody = {
        // Authentication credentials in body (REQUIRED)
        apiKey: ACCEPTPAY_API_KEY,
        apiSecret: ACCEPTPAY_API_SECRET,
        // Transaction details
        amount: request.amount,
        billId: request.billId,
        customerName: (request.customerName || 'Customer').substring(0, 50),
        mobileNumber: request.mobile,
        email: request.email,
        description: (request.description || 'NP Wellness Product').substring(0, 40),
        gateway: 'razorpay',
        // AcceptPay supported redirect/webhook parameters
        returnUrl: returnUrl,
        webhookUrl: webhookUrl
      };

      console.log('📤 Request body (without secrets):', {
        ...requestBody,
        apiKey: requestBody.apiKey.substring(0, 8) + '...',
        apiSecret: '***hidden***'
      });
      console.log('🔗 Return URL:', returnUrl);
      console.log('🔗 Webhook URL:', webhookUrl);

      const response = await fetch(`${ACCEPTPAY_API_URL}/api/v1/transaction/initiate-transaction`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('✅ AcceptPay RAW response:', JSON.stringify(data, null, 2));

      if (!response.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Payment creation failed');
      }

      // Response structure: { status, paymentLink, data: { _id, amount, status, billId } }
      const responseData = data.data || {};
      const paymentLink = data.paymentLink || '';
      const transactionId = responseData._id || responseData.transactionId || 'TXN_' + Date.now();

      console.log('📦 Full response:', data);
      console.log('🔗 Payment Link:', paymentLink);
      console.log('🆔 Transaction ID:', transactionId);

      // Normalize field names
      const normalizedData = {
        transactionId: transactionId,
        paymentLink: paymentLink,
        amount: responseData.amount || request.amount,
        currency: 'INR',
        status: responseData.status || 'initiated',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      };

      console.log('✅ Normalized payment data:', normalizedData);

      return {
        status: 'success',
        message: data.message || 'Transaction initiated',
        data: normalizedData
      };
    } catch (error) {
      console.error('❌ AcceptPay createPayment error:', error);
      throw error;
    }
  }

  /**
   * Generate QR Code for a transaction
   * POST /api/v1/transaction/request-transaction
   */
  static async generateQRCode(transactionId: string): Promise<QRCodeResponse> {
    try {
      console.log('🔄 Generating QR code for transaction:', transactionId);

      const response = await fetch(
        `${ACCEPTPAY_API_URL}/api/v1/transaction/request-transaction`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            transactionId: transactionId,
            method: 'qr',
            app: 'gpay'
          })
        }
      );

      const data = await response.json();
      console.log('✅ QR Code response:', data);

      if (!response.ok || data.status === 'fail') {
        throw new Error(data.message || 'QR code generation failed');
      }

      return data;
    } catch (error) {
      console.error('❌ AcceptPay generateQRCode error:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   * GET /api/v1/transaction/status-of-transaction/:transactionId
   */
  static async getTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    try {
      console.log('🔄 Checking AcceptPay transaction status:', transactionId);

      const response = await fetch(
        `${ACCEPTPAY_API_URL}/api/v1/transaction/status-of-transaction/${transactionId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();
      console.log('✅ Transaction status response:', data);

      if (!response.ok || data.status === 'fail') {
        console.warn('Status check returned:', data.message);
        return {
          status: 'success',
          data: {
            transactionId,
            status: 'pending',
            amount: 0,
            currency: 'INR'
          }
        };
      }

      // Normalize the response
      if (data.result) {
        return {
          status: 'success',
          result: data.result,
          data: {
            transactionId: data.result._id || transactionId,
            status: data.result.status === 'COMPLETED' ? 'success' :
              data.result.status === 'FAILED' ? 'failed' : 'pending',
            amount: data.result.amount || 0,
            currency: 'INR',
            paidAt: data.result.paidAt
          }
        };
      }

      return data;
    } catch (error) {
      console.error('❌ AcceptPay getTransactionStatus error:', error);
      return {
        status: 'success',
        data: {
          transactionId,
          status: 'pending',
          amount: 0,
          currency: 'INR'
        }
      };
    }
  }

  /**
   * List transactions with pagination
   * GET /api/v1/transaction/list
   */
  static async listTransactions(
    page: number = 1,
    limit: number = 10,
    status?: 'pending' | 'success' | 'failed' | 'refunded'
  ): Promise<TransactionListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(
        `${ACCEPTPAY_API_URL}/api/v1/transaction/list?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to list transactions');
      }

      return data;
    } catch (error) {
      console.error('❌ AcceptPay listTransactions error:', error);
      throw error;
    }
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  /**
   * Get status display info
   */
  static getStatusInfo(status: string): { text: string; color: string; icon: string } {
    switch (status.toLowerCase()) {
      case 'initiated':
      case 'pending':
        return { text: 'Payment Pending', color: 'yellow', icon: '⏳' };
      case 'completed':
      case 'success':
        return { text: 'Payment Successful', color: 'green', icon: '✅' };
      case 'failed':
        return { text: 'Payment Failed', color: 'red', icon: '❌' };
      case 'timeout':
        return { text: 'Payment Expired', color: 'orange', icon: '⏰' };
      case 'refunded':
        return { text: 'Payment Refunded', color: 'blue', icon: '↩️' };
      default:
        return { text: 'Unknown', color: 'gray', icon: '❓' };
    }
  }

  /**
   * Open payment link in new window/tab
   */
  static openPaymentLink(paymentLink: string): void {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      window.location.href = paymentLink;
    } else {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Generate QR code image URL from UPI string
   */
  static getQRCodeImageUrl(upiString: string, size: number = 200): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiString)}`;
  }
}

export default AcceptPayService;
