import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, ArrowRight, Home, Loader2 } from 'lucide-react';
import AcceptPayService from '@/services/acceptPayService';
import { OrderService } from '@/services/orderService';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [isLoading, setIsLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | 'unknown'>('pending');
    const [orderData, setOrderData] = useState<any>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    const content = {
        en: {
            title: 'Payment Successful!',
            pendingTitle: 'Verifying Payment...',
            failedTitle: 'Payment Could Not Be Verified',
            subtitle: 'Thank you for your order!',
            orderNumber: 'Order Number',
            amount: 'Amount Paid',
            transactionId: 'Transaction ID',
            whatNext: 'What happens next?',
            step1: 'We will process your order within 24 hours',
            step2: 'You will receive a shipping confirmation',
            step3: 'Track your order in the Orders section',
            continueShopping: 'Continue Shopping',
            viewOrders: 'View My Orders',
            checkingPayment: 'Checking payment status...',
            tryAgain: 'Try Again',
            contactSupport: 'If you completed the payment, please contact support.'
        },
        hi: {
            title: 'भुगतान सफल!',
            pendingTitle: 'भुगतान सत्यापित हो रहा है...',
            failedTitle: 'भुगतान सत्यापित नहीं हो सका',
            subtitle: 'आपके ऑर्डर के लिए धन्यवाद!',
            orderNumber: 'ऑर्डर नंबर',
            amount: 'भुगतान राशि',
            transactionId: 'ट्रांजेक्शन आईडी',
            whatNext: 'आगे क्या होगा?',
            step1: '24 घंटे के भीतर आपका ऑर्डर प्रोसेस किया जाएगा',
            step2: 'आपको शिपिंग कन्फर्मेशन मिलेगा',
            step3: 'ऑर्डर्स सेक्शन में अपना ऑर्डर ट्रैक करें',
            continueShopping: 'शॉपिंग जारी रखें',
            viewOrders: 'मेरे ऑर्डर देखें',
            checkingPayment: 'भुगतान स्थिति जांच रही है...',
            tryAgain: 'फिर से कोशिश करें',
            contactSupport: 'अगर आपने भुगतान पूरा किया है, तो कृपया सहायता से संपर्क करें।'
        }
    };

    const t = content[language];

    useEffect(() => {
        const checkPaymentAndSaveOrder = async () => {
            try {
                // Get transaction ID from URL params
                const txnId = searchParams.get('txn') || searchParams.get('transactionId');
                const orderNumber = searchParams.get('order') || searchParams.get('billId');

                console.log('🔍 Payment success page - params:', { txnId, orderNumber });
                setTransactionId(txnId);

                if (!txnId) {
                    setPaymentStatus('unknown');
                    setIsLoading(false);
                    return;
                }

                // Check payment status from AcceptPay
                const statusResponse = await AcceptPayService.getTransactionStatus(txnId);
                console.log('📥 AcceptPay status:', statusResponse);

                if (statusResponse.status === 'success' && statusResponse.data) {
                    const paymentResult = statusResponse.data.status?.toLowerCase();

                    if (paymentResult === 'completed' || paymentResult === 'success') {
                        setPaymentStatus('success');

                        // Get pending order from localStorage
                        const pendingOrders = JSON.parse(localStorage.getItem('np_pending_orders') || '[]');
                        const pendingOrder = pendingOrders.find((o: any) =>
                            o.transactionId === txnId || o.id === orderNumber
                        );

                        if (pendingOrder) {
                            setOrderData(pendingOrder);

                            // Update order status in Supabase (order already created with 'pending' status)
                            console.log('🔄 Updating order payment status in Supabase...');
                            const updateResult = await OrderService.updateOrderPaymentStatus(
                                pendingOrder.id,
                                txnId,
                                'paid'
                            );

                            if (updateResult.success) {
                                console.log('✅ Order updated to PAID in Supabase!');
                                // Clear from localStorage
                                const filtered = pendingOrders.filter((o: any) => o.id !== pendingOrder.id);
                                localStorage.setItem('np_pending_orders', JSON.stringify(filtered));
                            } else {
                                console.error('⚠️ Failed to update order:', updateResult.error);
                            }
                        } else {
                            console.log('⚠️ Pending order not found in localStorage, trying to update by order number...');
                            // Try to update by order number if we have it
                            if (orderNumber) {
                                const updateResult = await OrderService.updateOrderPaymentStatus(
                                    orderNumber,
                                    txnId,
                                    'paid'
                                );
                                if (updateResult.success) {
                                    console.log('✅ Order updated by order number!');
                                }
                            }
                        }
                    } else if (paymentResult === 'pending' || paymentResult === 'initiated') {
                        setPaymentStatus('pending');
                    } else {
                        setPaymentStatus('failed');
                    }
                } else {
                    setPaymentStatus('unknown');
                }
            } catch (error) {
                console.error('Error checking payment:', error);
                setPaymentStatus('unknown');
            } finally {
                setIsLoading(false);
            }
        };

        checkPaymentAndSaveOrder();
    }, [searchParams]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                    <Card className="w-full max-w-md mx-4 text-center">
                        <CardContent className="py-12">
                            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                            <h2 className="text-xl font-semibold">{t.checkingPayment}</h2>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-950">
                <Header />
                <main className="flex-1 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-lg text-center">
                        {/* Success Animation */}
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg shadow-green-500/30">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
                            {language === 'en' ? 'Payment Successful!' : 'भुगतान सफल!'}
                        </h1>

                        <Card className="mb-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                            <CardContent className="py-8">
                                <Package className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2 text-white">
                                    {language === 'en'
                                        ? '🎁 Your product will be delivered secretly to you.'
                                        : '🎁 आपका प्रोडक्ट गोपनीय रूप से आप तक पहुंचाया जाएगा।'}
                                </p>
                                <p className="text-gray-400">
                                    {language === 'en'
                                        ? 'We are processing your order. You will receive it within 5-7 business days.'
                                        : 'हम आपका ऑर्डर प्रोसेस कर रहे हैं। आपको 5-7 कार्य दिवसों में मिलेगा।'}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="text-sm text-gray-500">
                            <p>
                                {language === 'en'
                                    ? '🔒 100% Discreet Packaging • No branding on package'
                                    : '🔒 100% गोपनीय पैकेजिंग • पैकेज पर कोई ब्रांडिंग नहीं'}
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Pending or Failed state
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 py-12">
                <Card className="w-full max-w-md mx-4 text-center">
                    <CardContent className="py-12">
                        {paymentStatus === 'pending' ? (
                            <>
                                <Loader2 className="w-16 h-16 animate-spin text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">{t.pendingTitle}</h2>
                                <p className="text-muted-foreground mb-6">{t.checkingPayment}</p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">❌</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{t.failedTitle}</h2>
                                <p className="text-muted-foreground mb-6">{t.contactSupport}</p>
                            </>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button onClick={() => window.location.reload()}>
                                {t.tryAgain}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/">{t.continueShopping}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentSuccess;
