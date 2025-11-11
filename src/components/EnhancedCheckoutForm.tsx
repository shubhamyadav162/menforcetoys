import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Save, Wifi, WifiOff } from 'lucide-react';
import {
  validateShippingAddress,
  validateField,
  formatPhoneNumber,
  type ShippingAddressForm,
  type ValidationResult
} from '@/utils/formValidation';
import { OrderService, type OrderRequest, type PaymentOrderResponse } from '@/services/orderService';
import { ShippingAddressService } from '@/services/shippingAddressService';
import PaymentFlow from './PaymentFlow';
import {
  ErrorHandler,
  FeedbackManager,
  NetworkMonitor,
  FormSubmissionTracker,
  PerformanceMonitor,
  initializeMonitoring
} from '@/utils/errorHandling';

interface Product {
  id: string;
  name: { en: string; hi: string };
  price: number;
  image: string;
  description?: { en: string; hi: string };
}

interface EnhancedCheckoutFormProps {
  product: Product;
  userId?: string;
}

const EnhancedCheckoutForm: React.FC<EnhancedCheckoutFormProps> = ({ product, userId }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: {
      title: "Checkout",
      orderSummary: "Order Summary",
      productDetails: "Product Details",
      quantity: "Quantity",
      price: "Price",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      shippingInfo: "Shipping Information",
      fullName: "Full Name",
      phone: "Phone Number",
      address: "Delivery Address",
      addressLine2: "Address Line 2 (Optional)",
      landmark: "Landmark (Optional)",
      city: "City",
      state: "State",
      pincode: "PIN Code",
      paymentInfo: "Payment Information",
      gpay: "Pay securely with UPI apps (GPay / PhonePe / Paytm)",
      paymentNote: "Just enter your contact details and place the order. A secure UPI payment window will open automatically to finish the payment.",
      saveAddress: "Save this address for future orders",
      setAsDefault: "Set as default address",
      placeOrder: "Place Order",
      processing: "Processing...",
      orderSuccess: "Order Placed Successfully!",
      orderFailed: "Order Failed",
      validationError: "Please correct the errors below",
      networkError: "Network error. Please try again.",
      addressSaved: "Address saved successfully!",
      realTimeValidation: "Real-time validation enabled"
    },
    hi: {
      title: "चेकआउट",
      orderSummary: "ऑर्डर सारांश",
      productDetails: "उत्पाद विवरण",
      quantity: "मात्रा",
      price: "मूल्य",
      subtotal: "उप-योग",
      shipping: "शिपिंग",
      total: "कुल",
      shippingInfo: "शिपिंग जानकारी",
      fullName: "पूरा नाम",
      phone: "फोन नंबर",
      address: "डिलीवरी पता",
      addressLine2: "पता लाइन 2 (वैकल्पिक)",
      landmark: "लैंडमार्क (वैकल्पिक)",
      city: "शहर",
      state: "राज्य",
      pincode: "पिन कोड",
      paymentInfo: "भुगतान जानकारी",
      gpay: "UPI ऐप (GPay / PhonePe / Paytm) से सुरक्षित भुगतान",
      paymentNote: "बस अपने संपर्क विवरण भरें और ऑर्डर दें। भुगतान पूरा करने के लिए एक सुरक्षित UPI विंडो अपने आप खुल जाएगी।",
      saveAddress: "भविष्य के ऑर्डर के लिए इस पते को सहेजें",
      setAsDefault: "डिफ़ॉल्ट पता के रूप में सेट करें",
      placeOrder: "ऑर्डर दें",
      processing: "प्रसंस्करण...",
      orderSuccess: "ऑर्डर सफलतापूर्वक दिया गया!",
      orderFailed: "ऑर्डर विफल",
      validationError: "कृपया नीचे दिए गए त्रुटियों को सुधारें",
      networkError: "नेटवर्क त्रुटि। कृपया फिर से कोशिश करें।",
      addressSaved: "पता सफलतापूर्वक सहेजा गया!",
      realTimeValidation: "रीयल-टाइम सत्यापन सक्षम"
    }
  };

  const t = content[language];

  // Form state
  const [formData, setFormData] = useState<ShippingAddressForm>({
    fullName: '',
    phone: '',
    address: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  // UI state
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isRealTimeValidating, setIsRealTimeValidating] = useState(true);
  const [isOnline, setIsOnline] = useState(NetworkMonitor.isCurrentlyOnline());

  // Payment state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState<{
    orderId: string;
    amount: number;
    productInfo: {
      name: { en: string; hi: string };
      image?: string;
      quantity: number;
    };
  } | null>(null);

  // Initialize monitoring
  useEffect(() => {
    initializeMonitoring();
    
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      if (!online) {
        FeedbackManager.warning(
          language === 'en' ? 'Offline Mode' : 'ऑफलाइन मोड',
          language === 'en'
            ? 'You are currently offline. Some features may not work.'
            : 'आप वर्तमान में ऑफलाइन हैं। कुछ सुविधाएं काम नहीं कर सकतीं।'
        );
      }
    };

    NetworkMonitor.addListener(handleNetworkChange);
    
    return () => {
      NetworkMonitor.removeListener(handleNetworkChange);
    };
  }, [language]);

  // Calculate totals
  const subtotal = product.price * quantity;
  const shippingCost = 50;
  const total = subtotal + shippingCost;

  // Real-time field validation
  const validateFieldRealTime = useCallback((name: string, value: string) => {
    if (!isRealTimeValidating) return;
    
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [isRealTimeValidating]);

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Apply formatting for specific fields
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Real-time validation
    validateFieldRealTime(name, formattedValue);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  // Toggle real-time validation
  const toggleRealTimeValidation = () => {
    setIsRealTimeValidating(!isRealTimeValidating);
    if (isRealTimeValidating) {
      setFieldErrors({});
    }
  };

  // Validate entire form
  const validateForm = (): ValidationResult => {
    const addressValidation = validateShippingAddress(formData);

    return {
      isValid: addressValidation.isValid,
      errors: addressValidation.errors,
      warnings: { ...addressValidation.warnings }
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check network status
    if (!isOnline) {
      FeedbackManager.error(
        language === 'en' ? 'No Internet Connection' : 'इंटरनेट कनेक्शन नहीं',
        language === 'en'
          ? 'Please check your internet connection and try again.'
          : 'कृपया अपना इंटरनेट कनेक्शन जांचें और फिर से कोशिश करें।'
      );
      return;
    }

    // Check form submission rate limiting
    const trackingResult = FormSubmissionTracker.trackSubmission('checkout-form');
    if (!trackingResult.canSubmit) {
      FeedbackManager.warning(
        language === 'en' ? 'Slow Down' : 'धीरे करें',
        trackingResult.reason || language === 'en'
          ? 'Please wait before submitting again.'
          : 'फिर से सबमिट करने से पहले कृपया प्रतीक्षा करें।'
      );
      return;
    }

    // Start performance monitoring
    const endTimer = PerformanceMonitor.startTimer('order-submission');

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setSubmitError(t.validationError);
      ErrorHandler.logError('Form validation failed', 'Checkout Form', validation.errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare order request
      const orderRequest: OrderRequest = {
        product: {
          id: product.id,
          name: product.name,
          price: product.price
        },
        quantity,
        shippingAddress: formData,
        userId,
        saveAddress: saveAddress && !!userId,
        isDefaultAddress: isDefaultAddress && !!userId
      };

      // Create order with payment
      const result: PaymentOrderResponse = await OrderService.createOrderWithPayment(orderRequest);

      if (result.success && result.data) {
        endTimer();

        if (result.requiresPayment && result.paymentId) {
          // Show payment flow
          setOrderForPayment({
            orderId: result.data.id,
            amount: result.amount || total,
            productInfo: {
              name: product.name,
              image: product.image,
              quantity
            }
          });
          setShowPaymentFlow(true);

          FeedbackManager.success(
            language === 'en' ? 'Order Created!' : 'ऑर्डर बनाया गया!',
            language === 'en'
              ? 'Please complete the payment to confirm your order.'
              : 'कृपया अपने ऑर्डर की पुष्टि के लिए भुगतान पूर्ण करें।'
          );
        } else {
          // Order without payment (backup flow)
          setSubmitSuccess(true);
          setOrderNumber(result.orderNumber || result.data.id.slice(0, 8).toUpperCase());

          FeedbackManager.success(
            language === 'en' ? 'Order Placed!' : 'ऑर्डर दिया गया!',
            language === 'en'
              ? `Your order has been placed successfully. Order number: ${result.orderNumber || result.data.id.slice(0, 8).toUpperCase()}`
              : `आपका ऑर्डर सफलतापूर्वक दिया गया है। ऑर्डर नंबर: ${result.orderNumber || result.data.id.slice(0, 8).toUpperCase()}`
          );

          // Reset form after successful submission
          setTimeout(() => {
            setFormData({
              fullName: '',
              phone: '',
              address: '',
              addressLine2: '',
              landmark: '',
              city: '',
              state: '',
            pincode: ''
            });
            setQuantity(1);
            setSaveAddress(false);
            setIsDefaultAddress(false);
            setFieldErrors({});

            // Redirect to home after showing success message
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }, 2000);
        }
      } else {
        endTimer();
        const errorMessage = result.error || t.orderFailed;
        setSubmitError(errorMessage);
        ErrorHandler.logError(errorMessage, 'Order Creation', { orderRequest });
        FeedbackManager.error(
          language === 'en' ? 'Order Failed' : 'ऑर्डर विफल',
          errorMessage
        );
      }
    } catch (error) {
      endTimer();
      const errorMessage = t.networkError;
      setSubmitError(errorMessage);
      ErrorHandler.logError(error instanceof Error ? error : new Error(errorMessage), 'Order Submission');
      FeedbackManager.error(
        language === 'en' ? 'Submission Error' : 'सबमिशन त्रुटि',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (status: 'completed' | 'failed' | 'cancelled') => {
    setShowPaymentFlow(false);
    setOrderForPayment(null);

    if (status === 'completed') {
      setSubmitSuccess(true);
      setOrderNumber(orderForPayment?.orderId.slice(0, 8).toUpperCase() || 'SUCCESS');

      FeedbackManager.success(
        language === 'en' ? 'Payment Successful!' : 'भुगतान सफल!',
        language === 'en'
          ? 'Your order has been confirmed and will be processed soon.'
          : 'आपका ऑर्डर पुष्टि कर दिया गया है और जल्द ही प्रोसेस किया जाएगा।'
      );

      // Reset form and redirect
      setTimeout(() => {
        setFormData({
          fullName: '',
          phone: '',
          address: '',
          addressLine2: '',
          landmark: '',
          city: '',
          state: '',
        pincode: ''
        });
        setQuantity(1);
        setSaveAddress(false);
        setIsDefaultAddress(false);
        setFieldErrors({});

        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }, 2000);
    } else if (status === 'failed') {
      FeedbackManager.error(
        language === 'en' ? 'Payment Failed' : 'भुगतान विफल',
        language === 'en'
          ? 'The payment could not be processed. Please try again.'
          : 'भुगतान प्रोसेस नहीं किया जा सका। कृपया फिर से कोशिश करें।'
      );
    } else {
      FeedbackManager.warning(
        language === 'en' ? 'Payment Cancelled' : 'भुगतान रद्द',
        language === 'en'
          ? 'Payment was cancelled. You can try again if needed.'
          : 'भुगतान रद्द कर दिया गया। आप आवश्यकतानुसार फिर से कोशिश कर सकते हैं।'
      );
    }
  };

  // Handle payment flow close
  const handlePaymentClose = () => {
    setShowPaymentFlow(false);
    setOrderForPayment(null);
  };

  // Success message component
  const SuccessMessage = () => (
    <Alert className="mb-6 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="font-semibold">{t.orderSuccess}</div>
        <div className="text-sm mt-1">
          Order Number: <span className="font-mono font-bold">{orderNumber}</span>
        </div>
        <div className="text-sm mt-1">
          {language === 'en' 
            ? `Product: ${product.name.en} | Quantity: ${quantity} | Total: ₹${total}`
            : `उत्पाद: ${product.name.hi} | मात्रा: ${quantity} | कुल: ₹${total}`
          }
        </div>
        <div className="text-xs mt-2 text-green-600">
          {language === 'en' ? 'Redirecting to home...' : 'होम पर रीडायरेक्ट किया जा रहा है...'}
        </div>
      </AlertDescription>
    </Alert>
  );

  // Error message component
  const ErrorMessage = ({ error }: { error: string }) => (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">{error}</AlertDescription>
    </Alert>
  );

  // Field error component
  const FieldError = ({ fieldName }: { fieldName: string }) => {
    const error = fieldErrors[fieldName];
    if (!error) return null;
    
    return (
      <span className="text-xs text-red-500 mt-1 block">{error}</span>
    );
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-secondary/20 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <SuccessMessage />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Payment Flow Modal */}
      {showPaymentFlow && orderForPayment && (
        <PaymentFlow
          orderId={orderForPayment.orderId}
          amount={orderForPayment.amount}
          productInfo={orderForPayment.productInfo}
          onPaymentComplete={handlePaymentComplete}
          onClose={handlePaymentClose}
        />
      )}

      {/* Regular Checkout Form */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-secondary/20 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              <Badge variant={isRealTimeValidating ? "default" : "secondary"} className="text-xs">
                {t.realTimeValidation}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRealTimeValidation}
                className="text-xs"
              >
                {isRealTimeValidating ? 'Disable' : 'Enable'} Real-time
              </Button>
            </div>
          </div>

          {submitError && <ErrorMessage error={submitError} />}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.orderSummary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name[language]}
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {product.name[language]}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {product.description?.[language]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label>{t.quantity}:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t.subtotal}:</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.shipping}:</span>
                      <span>₹{shippingCost}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t.total}:</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping & Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.shippingInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">{t.fullName}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={fieldErrors.fullName ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="fullName" />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={fieldErrors.phone ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="phone" />
                  </div>

                  <div>
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apt 4B"
                      className={fieldErrors.address ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="address" />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">{t.addressLine2}</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Apartment, Suite, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="landmark">{t.landmark}</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Near Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t.city}</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className={fieldErrors.city ? 'border-red-500' : ''}
                      />
                      <FieldError fieldName="city" />
                    </div>
                    <div>
                      <Label htmlFor="state">{t.state}</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className={fieldErrors.state ? 'border-red-500' : ''}
                      />
                      <FieldError fieldName="state" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pincode">{t.pincode}</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className={fieldErrors.pincode ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="pincode" />
                  </div>

                  <Separator />

                  <div>
                    <Label>{t.paymentInfo}</Label>
                    <div className="mt-2 p-4 bg-primary/10 rounded-lg space-y-2">
                      <p className="font-medium">{t.gpay}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.paymentNote}
                      </p>
                    </div>
                  </div>

                  {userId && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveAddress"
                          checked={saveAddress}
                          onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                        />
                        <Label htmlFor="saveAddress" className="text-sm">
                          {t.saveAddress}
                        </Label>
                      </div>
                      
                      {saveAddress && (
                        <div className="flex items-center space-x-2 ml-6">
                          <Checkbox
                            id="isDefaultAddress"
                            checked={isDefaultAddress}
                            onCheckedChange={(checked) => setIsDefaultAddress(checked as boolean)}
                          />
                          <Label htmlFor="isDefaultAddress" className="text-sm">
                            {t.setAsDefault}
                          </Label>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.processing}
                      </>
                    ) : (
                      t.placeOrder
                    )}
                  </Button>

                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      🛡️ 100% Discreet Delivery
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </div>
    </>
  );
};

export default EnhancedCheckoutForm;