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
  Copy,
  Share2,
  ExternalLink,
  XCircle,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import PaymentGatewayService, { PaymentStatusPoller } from '@/services/paymentGatewayService';

interface PaymentFlowProps {
  orderId: string;
  amount: number;
  productInfo: {
    name: { en: string; hi: string };
    image?: string;
    quantity?: number;
  };
  existingPaymentData?: {
    paymentId: string;
    transactionId: string;
    gatewayOrderId: string;
    upiString: string;
    amount: number;
    currency: string;
    expiresAt: string;
    status: string;
  };
  onPaymentComplete?: (status: 'completed' | 'failed' | 'cancelled') => void;
  onClose?: () => void;
}

interface PaymentData {
  paymentId: string;
  transactionId: string;
  gatewayOrderId: string;
  upiString: string;
  amount: number;
  currency: string;
  expiresAt: string;
  status: string;
}

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timeRemaining?: number;
  isExpired?: boolean;
  vpaId?: string;
  bankRef?: string;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  orderId,
  amount,
  productInfo,
  existingPaymentData,
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
      upiPayment: "UPI Payment",
      payNow: "Pay Now",
      copyUpi: "Copy UPI",
      sharePayment: "Share",
      openUpiApp: "Open UPI App",
      checkingStatus: "Checking payment status...",
      paymentPending: "Payment Pending",
      paymentCompleted: "Payment Successful!",
      paymentFailed: "Payment Failed",
      paymentCancelled: "Payment Cancelled",
      cancelPayment: "Cancel Payment",
      retryPayment: "Try Again",
      close: "Close",
      expireWarning: "Payment expires in",
      expired: "Payment expired",
      instructions: {
        title: "How to Pay",
        step1: "Click 'Pay Now' or copy the UPI ID",
        step2: "Open your UPI app (GPay, PhonePe, Paytm, etc.)",
        step3: "Enter the amount and complete the payment",
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
      upiPayment: "यूपीआई भुगतान",
      payNow: "अभी भुगतान करें",
      copyUpi: "यूपीआई कॉपी करें",
      sharePayment: "शेयर करें",
      openUpiApp: "यूपीआई ऐप खोलें",
      checkingStatus: "भुगतान स्थिति जांच रहे हैं...",
      paymentPending: "भुगतान लंबित",
      paymentCompleted: "भुगतान सफल!",
      paymentFailed: "भुगतान विफल",
      paymentCancelled: "भुगतान रद्द",
      cancelPayment: "भुगतान रद्द करें",
      retryPayment: "फिर से कोशिश करें",
      close: "बंद करें",
      expireWarning: "भुगतान समाप्त होगा",
      expired: "भुगतान समय सीमा समाप्त",
      instructions: {
        title: "भुगतान कैसे करें",
        step1: "'अभी भुगतान करें' पर क्लिक करें या यूपीआई आईडी कॉपी करें",
        step2: "अपना यूपीआई ऐप खोलें (जीपे, फोनपे, पेटीएम आदि)",
        step3: "राशि दर्ज करें और भुगतान पूर्ण करें",
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

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollerRef = useRef<PaymentStatusPoller | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Initialize payment
  useEffect(() => {
    initializePayment();

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (pollerRef.current) {
      pollerRef.current.stop();
    }
    if (subscriptionRef.current) {
      PaymentGatewayService.unsubscribeFromPaymentUpdates(subscriptionRef.current);
    }
  };

  const initializePayment = async () => {
    try {
      setCreating(true);
      setError(null);

      // Use existing payment data if provided, otherwise create new payment
      if (existingPaymentData) {
        console.log('Using existing payment data:', existingPaymentData);
        setPayment(existingPaymentData);

        // Start status polling for existing payment
        pollerRef.current = new PaymentStatusPoller(
          existingPaymentData.paymentId,
          handlePaymentStatusUpdate
        );
        pollerRef.current.start();

        // Subscribe to real-time updates
        subscriptionRef.current = PaymentGatewayService.subscribeToPaymentUpdates(
          orderId,
          (payload) => {
            console.log('Real-time payment update:', payload);
            handlePaymentStatusUpdate({
              success: true,
              data: {
                ...payload,
                paymentId: existingPaymentData.paymentId,
                orderId,
                amount,
                currency: 'INR'
              }
            });
          }
        );
      } else {
        // Create new payment (fallback)
        const response = await PaymentGatewayService.createPayment({
          orderId,
          amount
        });

        if (response.success && response.data) {
          setPayment(response.data);

          // Start status polling
          pollerRef.current = new PaymentStatusPoller(
            response.data.paymentId,
            handlePaymentStatusUpdate
          );
          pollerRef.current.start();

          // Subscribe to real-time updates
          subscriptionRef.current = PaymentGatewayService.subscribeToPaymentUpdates(
            orderId,
            (payload) => {
              console.log('Real-time payment update:', payload);
              handlePaymentStatusUpdate({
                success: true,
                data: {
                  ...payload,
                  paymentId: response.data.paymentId,
                  orderId,
                  amount,
                  currency: 'INR'
                }
              });
            }
          );
        } else {
          setError(response.error || 'Failed to create payment');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment initialization failed');
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  const handlePaymentStatusUpdate = (status: any) => {
    if (status.success && status.data) {
      const newStatus: PaymentStatus = {
        status: status.data.status,
        timeRemaining: status.data.timeRemaining,
        isExpired: status.data.isExpired,
        vpaId: status.data.vpaId,
        bankRef: status.data.bankRef
      };

      setPaymentStatus(newStatus);

      // Handle completion
      if (['completed', 'failed', 'cancelled'].includes(newStatus.status)) {
        cleanup();
        onPaymentComplete?.(newStatus.status);
      }
    }
  };

  const handleCopyUpi = async () => {
    if (!payment?.upiString) return;

    const success = await PaymentGatewayService.copyUpiToClipboard(payment.upiString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSharePayment = async () => {
    if (!payment) return;

    await PaymentGatewayService.sharePaymentDetails({
      amount: payment.amount,
      upiString: payment.upiString,
      transactionId: payment.transactionId
    });
  };

  const handleOpenUpiApp = () => {
    if (!payment?.upiString) return;

    const upiUrl = PaymentGatewayService.generateUpiPaymentUrl(payment.upiString);
    window.open(upiUrl, '_blank');
  };

  const handleCancelPayment = async () => {
    if (!payment) return;

    const response = await PaymentGatewayService.cancelPayment(
      payment.paymentId,
      'User cancelled payment'
    );

    if (response.success) {
      cleanup();
      onPaymentComplete?.('cancelled');
    }
  };

  const handleRetryPayment = () => {
    setPayment(null);
    setPaymentStatus(null);
    setError(null);
    initializePayment();
  };

  const formatTimeRemaining = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return t.expired;
    return PaymentGatewayService.formatTimeRemaining(seconds);
  };

  const getStatusIcon = () => {
    if (!paymentStatus?.status) return <Clock className="w-5 h-5 text-yellow-500" />;

    switch (paymentStatus.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (!paymentStatus?.status) return 'yellow';

    switch (paymentStatus.status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'yellow';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">{t.checkingStatus}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetryPayment} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.retryPayment}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus?.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">{t.paymentCompleted}</h3>
            <Badge variant="secondary" className="mb-4">
              {getStatusIcon()}
              <span className="ml-2">{t.status.completed}</span>
            </Badge>
            {paymentStatus.bankRef && (
              <p className="text-sm text-muted-foreground mb-4">
                Bank Reference: {paymentStatus.bankRef}
              </p>
            )}
            <Button onClick={() => navigate('/orders')} className="w-full">
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus?.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">{t.paymentFailed}</h3>
            <Badge variant="destructive" className="mb-4">
              {getStatusIcon()}
              <span className="ml-2">{t.status.failed}</span>
            </Badge>
            <div className="space-y-2">
              <Button onClick={handleRetryPayment} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.retryPayment}
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                {t.close}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{t.title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
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
                    {PaymentGatewayService.formatAmount(payment.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="text-center">
              <Badge variant="outline" className={`bg-${getStatusColor()}-50 text-${getStatusColor()}-700 border-${getStatusColor()}-200`}>
                {getStatusIcon()}
                <span className="ml-2">
                  {paymentStatus?.status === 'pending' ? t.paymentPending :
                   paymentStatus?.status === 'cancelled' ? t.paymentCancelled :
                   paymentStatus?.status || t.paymentPending}
                </span>
              </Badge>

              {paymentStatus?.timeRemaining !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {t.expireWarning}: {formatTimeRemaining(paymentStatus.timeRemaining)}
                    </span>
                  </div>
                  {paymentStatus.timeRemaining > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(paymentStatus.timeRemaining / 180) * 100}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Details */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.transactionId}:</span>
                <span className="font-mono text-sm">{payment.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.orderId}:</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.amount}:</span>
                <span className="font-bold">
                  {PaymentGatewayService.formatAmount(payment.amount)}
                </span>
              </div>
            </div>

            {/* UPI Payment */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <h4 className="font-semibold">{t.upiPayment}</h4>
              </div>

              <div className="bg-white border rounded p-3">
                <p className="font-mono text-sm break-all text-center">
                  {payment.upiString}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUpi}
                  disabled={copied}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : t.copyUpi}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSharePayment}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t.sharePayment}
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleOpenUpiApp}
                disabled={paymentStatus?.isExpired}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.openUpiApp}
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
            {paymentStatus?.status === 'pending' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelPayment}
                disabled={paymentStatus?.isExpired}
              >
                {t.cancelPayment}
              </Button>
            )}

            {/* Expired Warning */}
            {paymentStatus?.isExpired && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t.expired}. Please retry the payment.
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