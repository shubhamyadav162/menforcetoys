import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  XCircle,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import AcceptPayService from '@/services/acceptPayService';
import { OrderService } from '@/services/orderService';
import type { ShippingAddressForm } from '@/utils/formValidation';

interface PaymentFlowProps {
  orderId: string;
  amount: number;
  productInfo: {
    id?: string;
    name: { en: string; hi: string };
    image?: string;
    quantity?: number;
    price?: number;
  };
  shippingAddress?: ShippingAddressForm;
  paymentData?: {
    transactionId: string;
    paymentLink: string;
    amount: number;
    currency: string;
    status: string;
    expiresAt: string;
  };
  onPaymentComplete?: (status: 'completed' | 'failed' | 'cancelled') => void;
  onClose?: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  orderId,
  amount,
  productInfo,
  shippingAddress,
  paymentData,
  onPaymentComplete,
  onClose
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: {
      title: "Complete Payment",
      amount: "Amount",
      transactionId: "Transaction ID",
      orderId: "Order ID",
      timeRemaining: "Time Remaining",
      payNow: "Pay Now",
      checkingStatus: "Checking payment status...",
      paymentPending: "Payment Pending",
      paymentCompleted: "Payment Successful!",
      paymentFailed: "Payment Failed",
      paymentCancelled: "Payment Cancelled",
      cancelPayment: "Cancel",
      retryPayment: "Try Again",
      close: "Close",
      expireWarning: "Payment expires in",
      expired: "Payment expired",
      instructions: {
        title: "How to Pay",
        step1: "Click 'Pay Now' to open the payment page",
        step2: "Complete the payment using UPI (GPay, PhonePe, Paytm, etc.)",
        step3: "Return to this page after payment",
        step4: "Payment confirmation will appear automatically"
      },
      status: {
        pending: "Waiting for payment",
        completed: "Payment received successfully",
        failed: "Payment could not be processed",
        cancelled: "Payment was cancelled"
      }
    },
    hi: {
      title: "भुगतान पूर्ण करें",
      amount: "राशि",
      transactionId: "लेनदेन आईडी",
      orderId: "ऑर्डर आईडी",
      timeRemaining: "समय शेष",
      payNow: "अभी भुगतान करें",
      checkingStatus: "भुगतान स्थिति जांच रहे हैं...",
      paymentPending: "भुगतान लंबित",
      paymentCompleted: "भुगतान सफल!",
      paymentFailed: "भुगतान विफल",
      paymentCancelled: "भुगतान रद्द",
      cancelPayment: "रद्द करें",
      retryPayment: "फिर से कोशिश करें",
      close: "बंद करें",
      expireWarning: "भुगतान समाप्त होगा",
      expired: "भुगतान समय सीमा समाप्त",
      instructions: {
        title: "भुगतान कैसे करें",
        step1: "भुगतान पृष्ठ खोलने के लिए 'अभी भुगतान करें' पर क्लिक करें",
        step2: "UPI (GPay, PhonePe, Paytm आदि) से भुगतान पूर्ण करें",
        step3: "भुगतान के बाद इस पृष्ठ पर वापस आएं",
        step4: "भुगतान पुष्टि स्वचालित रूप से प्रकट होगी"
      },
      status: {
        pending: "भुगतान की प्रतीक्षा में",
        completed: "भुगतान सफलतापूर्वक प्राप्त हुआ",
        failed: "भुगतान प्रोसेस नहीं किया जा सका",
        cancelled: "भुगतान रद्द कर दिया गया"
      }
    }
  };

  const t = content[language];

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'refunded'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(180); // 3 minutes
  const [isExpired, setIsExpired] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown timer
  useEffect(() => {
    if (paymentData?.expiresAt) {
      const expiresAt = new Date(paymentData.expiresAt).getTime();

      countdownRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsExpired(true);
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [paymentData?.expiresAt]);

  // Poll for payment status
  useEffect(() => {
    if (paymentData?.transactionId && paymentStatus === 'pending' && !isExpired) {
      pollingRef.current = setInterval(async () => {
        try {
          const statusResponse = await AcceptPayService.getTransactionStatus(paymentData.transactionId);

          if (statusResponse.status === 'success' && statusResponse.data) {
            const newStatus = statusResponse.data.status;
            setPaymentStatus(newStatus);

            if (newStatus === 'success') {
              if (pollingRef.current) clearInterval(pollingRef.current);

              // Save order to Supabase on successful payment
              if (shippingAddress && productInfo.id && productInfo.price) {
                console.log('💾 Payment successful! Saving order to Supabase...');
                try {
                  const saveResult = await OrderService.saveOrderToSupabase({
                    orderNumber: orderId,
                    product: {
                      id: productInfo.id,
                      name: productInfo.name,
                      price: productInfo.price
                    },
                    quantity: productInfo.quantity || 1,
                    shippingAddress: shippingAddress,
                    totalAmount: amount,
                    transactionId: paymentData.transactionId,
                    paymentStatus: 'success'
                  });

                  if (saveResult.success) {
                    console.log('✅ Order saved to Supabase successfully!');
                  } else {
                    console.error('⚠️ Failed to save order:', saveResult.error);
                  }
                } catch (saveError) {
                  console.error('❌ Error saving order to Supabase:', saveError);
                }
              } else {
                console.warn('⚠️ Missing data for Supabase save:', { shippingAddress, productInfo });
              }

              onPaymentComplete?.('completed');
            } else if (newStatus === 'failed') {
              if (pollingRef.current) clearInterval(pollingRef.current);
              onPaymentComplete?.('failed');
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentData?.transactionId, paymentStatus, isExpired, onPaymentComplete, shippingAddress, productInfo, orderId, amount]);

  const handlePayNow = () => {
    console.log('🔘 Pay Now clicked!');
    console.log('📦 Payment Data:', paymentData);
    console.log('🔗 Payment Link:', paymentData?.paymentLink);

    if (paymentData?.paymentLink) {
      console.log('✅ Opening payment link:', paymentData.paymentLink);
      // Try multiple methods to open the link
      const paymentUrl = paymentData.paymentLink;

      // Method 1: window.open (works for most browsers)
      const newWindow = window.open(paymentUrl, '_blank', 'noopener,noreferrer');

      // Method 2: If popup blocked, try direct navigation
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log('⚠️ Popup may be blocked, trying direct navigation...');
        window.location.href = paymentUrl;
      }
    } else {
      console.error('❌ No payment link available!');
      alert('Payment link not available. Please try again.');
    }
  };

  const handleClose = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    onClose?.();
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return t.expired;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">{t.checkingStatus}</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">{t.paymentCompleted}</h3>
            <Badge variant="secondary" className="mb-4">
              {getStatusIcon()}
              <span className="ml-2">{t.status.completed}</span>
            </Badge>
            <Button onClick={() => navigate('/orders')} className="w-full">
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">{t.paymentFailed}</h3>
            <Badge variant="destructive" className="mb-4">
              {getStatusIcon()}
              <span className="ml-2">{t.status.failed}</span>
            </Badge>
            <div className="space-y-2">
              <Button onClick={handlePayNow} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.retryPayment}
              </Button>
              <Button onClick={handleClose} variant="outline" className="w-full">
                {t.close}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{t.title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                {productInfo.image && (
                  <img
                    src={productInfo.image}
                    alt={productInfo.name[language]}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{productInfo.name[language]}</h4>
                  {productInfo.quantity && (
                    <p className="text-sm text-muted-foreground">
                      Quantity: {productInfo.quantity}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {AcceptPayService.formatAmount(paymentData.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="text-center">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {getStatusIcon()}
                <span className="ml-2">{t.paymentPending}</span>
              </Badge>

              {!isExpired && (
                <div className="mt-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {t.expireWarning}: {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timeRemaining / 180) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Details */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.transactionId}:</span>
                <span className="font-mono text-sm">{paymentData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.orderId}:</span>
                <span className="font-mono text-sm">{orderId.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.amount}:</span>
                <span className="font-bold">
                  {AcceptPayService.formatAmount(paymentData.amount)}
                </span>
              </div>
            </div>

            {/* Pay Now Button */}
            <div className="space-y-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
                onClick={handlePayNow}
                disabled={isExpired}
              >
                <Smartphone className="w-5 h-5 mr-2" />
                {t.payNow}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">{t.instructions.title}</h5>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. {t.instructions.step1}</li>
                <li>2. {t.instructions.step2}</li>
                <li>3. {t.instructions.step3}</li>
                <li>4. {t.instructions.step4}</li>
              </ol>
            </div>

            {/* Cancel Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClose}
            >
              {t.cancelPayment}
            </Button>

            {/* Expired Warning */}
            {isExpired && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t.expired}. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFlow;