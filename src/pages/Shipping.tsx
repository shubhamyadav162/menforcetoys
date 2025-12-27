import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, RefreshCw, Clock, Shield, IndianRupee } from "lucide-react";

const Shipping = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Shipping & Returns",
      subtitle: "Discreet delivery and hassle-free returns",
      shippingPolicy: "Shipping Policy",
      shippingInfo: "Shipping Information",
      deliveryTime: "Delivery Times",
      processing: "Order Processing",
      fees: "Shipping Fees",
      tracking: "Order Tracking",
      returnsPolicy: "Returns Policy",
      returnEligibility: "Return Eligibility",
      returnProcess: "Return Process",
      refundPolicy: "Refund Policy",
      exchangePolicy: "Exchange Policy",
      contactSupport: "Contact Support",

      shipping: {
        standard: "Standard Delivery",
        express: "Express Delivery",
        free: "Free Shipping",
        discreet: "100% Discreet Packaging",
        processingTime: "Processing Time: 1-2 business days",
        standardDelivery: "3-5 business days",
        expressDelivery: "1-2 business days",
        orderAbove: "On orders above ₹999",
        orderBelow: "On orders below ₹999",
        trackingInfo: "Tracking information sent via email and SMS",
        signatureRequired: "No signature required for discretion",
        plainPackaging: "Plain brown boxes with no branding",
        secureDelivery: "Secure and confidential delivery"
      },

      returns: {
        days: "30-Day Return Window",
        condition: "Unused and in original packaging",
        hygiene: "Hygiene seal must be intact",
        defective: "Defective products accepted",
        wrongItem: "Wrong item delivered",
        qualityIssue: "Quality issues",
        easyProcess: "Easy return process",
        emailRequired: "Email us with order details",
        pickupAvailable: "Free pickup available",
        refundTime: "Refund processed within 5-7 days",
        exchangeAvailable: "Exchange available for most products",
        customerSupport: "24/7 customer support"
      }
    },
    hi: {
      title: "शिपिंग और रिटर्न",
      subtitle: "गोपनीय डिलीवरी और परेशानी मुक्त रिटर्न",
      shippingPolicy: "शिपिंग नीति",
      shippingInfo: "शिपिंग जानकारी",
      deliveryTime: "डिलीवरी समय",
      processing: "ऑर्डर प्रोसेसिंग",
      fees: "शिपिंग शुल्क",
      tracking: "ऑर्डर ट्रैकिंग",
      returnsPolicy: "रिटर्न नीति",
      returnEligibility: "रिटर्न पात्रता",
      returnProcess: "रिटर्न प्रक्रिया",
      refundPolicy: "रिफंड नीति",
      exchangePolicy: "एक्सचेंज नीति",
      contactSupport: "सहायता से संपर्क करें",

      shipping: {
        standard: "स्टैंडर्ड डिलीवरी",
        express: "एक्सप्रेस डिलीवरी",
        free: "मुफ्त शिपिंग",
        discreet: "100% गोपनीय पैकेजिंग",
        processingTime: "प्रोसेसिंग समय: 1-2 व्यावसायिक दिन",
        standardDelivery: "3-5 व्यावसायिक दिन",
        expressDelivery: "1-2 व्यावसायिक दिन",
        orderAbove: "₹999 से अधिक के ऑर्डर पर",
        orderBelow: "₹999 से कम के ऑर्डर पर",
        trackingInfo: "ईमेल और एसएमएस के माध्यम से ट्रैकिंग जानकारी भेजी गई",
        signatureRequired: "गोपनीयता के लिए हस्ताक्षर की आवश्यकता नहीं",
        plainPackaging: "बिना ब्रांडिंग के सादे ब्राउन बॉक्स",
        secureDelivery: "सुरक्षित और गोपनीय डिलीवरी"
      },

      returns: {
        days: "30-दिन की रिटर्न विंडो",
        condition: "बिना उपयोग किया और मूल पैकेजिंग में",
        hygiene: "हाइजीन सील अखंड होनी चाहिए",
        defective: "दोषपूर्ण उत्पाद स्वीकार किए जाते हैं",
        wrongItem: "गलत आइटम डिलीवर किया गया",
        qualityIssue: "गुणवत्ता संबंधी समस्याएं",
        easyProcess: "आसान रिटर्न प्रक्रिया",
        emailRequired: "ऑर्डर विवरण के साथ हमें ईमेल करें",
        pickupAvailable: "मुफ्त पिकअप उपलब्ध",
        refundTime: "5-7 दिनों के भीतर रिफंड प्रोसेस किया जाता है",
        exchangeAvailable: "अधिकांश उत्पादों के लिए एक्सचेंज उपलब्ध",
        customerSupport: "24/7 ग्राहक सहायता"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <Truck className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Shipping Policy */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    {t.shippingPolicy}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t.deliveryTime}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <div>
                          <p className="font-medium">{t.shipping.standard}</p>
                          <p className="text-sm text-muted-foreground">{t.shipping.standardDelivery}</p>
                        </div>
                        <Badge variant="secondary">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          50
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <div>
                          <p className="font-medium">{t.shipping.express}</p>
                          <p className="text-sm text-muted-foreground">{t.shipping.expressDelivery}</p>
                        </div>
                        <Badge variant="secondary">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          150
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">{t.processing}</h3>
                    <p className="text-muted-foreground mb-2">{t.shipping.processingTime}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                        <span>{t.shipping.free}: {t.shipping.orderAbove}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                        <span>{t.shipping.fees}: {t.shipping.orderBelow}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {t.shipping.discreet}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-primary" />
                        <span>{t.shipping.plainPackaging}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>{t.shipping.secureDelivery}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-primary" />
                        <span>{t.shipping.signatureRequired}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t.tracking}
                    </h3>
                    <p className="text-muted-foreground text-sm">{t.shipping.trackingInfo}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Returns Policy */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-6 w-6 text-primary" />
                    {t.returnsPolicy}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{t.returnEligibility}</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {t.returns.days}
                          </Badge>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• {t.returns.condition}</li>
                          <li>• {t.returns.hygiene}</li>
                          <li>• {t.returns.defective}</li>
                          <li>• {t.returns.wrongItem}</li>
                          <li>• {t.returns.qualityIssue}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">{t.returnProcess}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                        <div>
                          <p className="font-medium">{t.emailRequired}</p>
                          <p className="text-sm text-muted-foreground">support@manforcesextoys.in</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        <div>
                          <p className="font-medium">{t.pickupAvailable}</p>
                          <p className="text-sm text-muted-foreground">Schedule at your convenience</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                        <div>
                          <p className="font-medium">{t.refundTime}</p>
                          <p className="text-sm text-muted-foreground">Original payment method</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">{t.exchangePolicy}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{t.returns.exchangeAvailable}</p>
                    <p className="text-muted-foreground text-sm mb-3">{t.returns.easyProcess}</p>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t.contactSupport}
                    </h4>
                    <p className="text-sm text-muted-foreground">{t.returns.customerSupport}</p>
                    <p className="text-sm text-primary">📧 Email: support@manforcesextoys.in</p>
                    <p className="text-sm text-primary">📞 Phone: +91-9876543210</p>
                    <p className="text-sm text-primary">🕒 Support Hours: 10 AM – 10 PM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Quality Assured</h4>
                    <p className="text-sm text-muted-foreground">All products are genuine and quality tested</p>
                  </div>
                  <div>
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium mb-1">100% Secure</h4>
                    <p className="text-sm text-muted-foreground">Your privacy and security are our priority</p>
                  </div>
                  <div>
                    <RefreshCw className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Hassle-Free Returns</h4>
                    <p className="text-sm text-muted-foreground">Easy returns and exchanges within 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shipping;