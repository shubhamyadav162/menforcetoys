import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, AlertTriangle, Users, Clock, Gavel, Package, CreditCard } from "lucide-react";

const TermsConditions = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Terms & Conditions",
      subtitle: "Please read these terms carefully",
      lastUpdated: "Last Updated: November 8, 2024",
      agreement: "By using our website and services, you agree to these Terms & Conditions.",

      sections: {
        acceptance: "Acceptance of Terms",
        acceptanceText: "By accessing and using Svaad's website and services, you accept and agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our website or services.",

        ageRestriction: "Age Restriction",
        ageText: "Our products and services are intended for individuals who are 18 years of age or older. By using our website, you confirm that you are at least 18 years old.",

        products: "Products and Services",
        productDescription: "We offer adult wellness products designed for personal use. All products are described as accurately as possible. We reserve the right to modify product descriptions, prices, or availability without notice.",
        productAvailability: "Product availability is subject to change. We do not warrant that product descriptions or colors are accurate, complete, reliable, current, or error-free.",

        pricing: "Pricing and Payment",
        pricingText: "All prices are listed in Indian Rupees (INR) and are inclusive of all applicable taxes. We reserve the right to change prices at any time without notice.",
        paymentMethods: "We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery. All payment information is processed securely.",

        orders: "Order Processing",
        orderConfirmation: "When you place an order, you will receive an order confirmation email. This does not guarantee acceptance of your order.",
        orderAcceptance: "We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspicious activity.",

        shipping: "Shipping and Delivery",
        shippingText: "We ship to all major cities and towns in India. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or other factors beyond our control.",
        deliveryRisk: "Risk of loss and title for all merchandise ordered on this Web site pass to you when the merchandise is delivered to the shipping carrier.",

        returns: "Returns and Refunds",
        returnPolicy: "We offer a 30-day return policy for unused products in original packaging. Please refer to our Shipping & Returns page for detailed information.",
        nonReturnable: "Due to health and safety regulations, certain products may not be eligible for return. These include products that have been opened or used.",

        intellectualProperty: "Intellectual Property",
        ipText: "All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Svaad and protected by intellectual property laws.",

        userConduct: "User Conduct",
        prohibitedActs: "You agree not to:",
        prohibitedList: "Use the website for illegal purposes, Upload or transmit malicious code, Attempt to gain unauthorized access, Violate any applicable laws or regulations, Harass or abuse other users",

        privacy: "Privacy",
        privacyText: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.",

        disclaimer: "Disclaimer of Warranties",
        warrantyText: "Our website and services are provided on an 'as is' and 'as available' basis. We make no warranties, expressed or implied, and hereby disclaim all warranties.",

        limitation: "Limitation of Liability",
        liabilityText: "In no event shall Svaad, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, or consequential damages.",

        indemnification: "Indemnification",
        indemnificationText: "You agree to indemnify and hold harmless Svaad and its affiliates from any claim, demand, or damage arising from your use of our website or services.",

        termination: "Termination",
        terminationText: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.",

        changes: "Changes to Terms",
        changesText: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website.",

        governing: "Governing Law",
        governingText: "These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.",

        dispute: "Dispute Resolution",
        disputeText: "Any dispute arising from these terms shall be resolved through mutual discussion. If no resolution is reached, the matter shall be subject to the jurisdiction of courts in Mumbai, Maharashtra.",

        contact: "Contact Information",
        contactText: "If you have any questions about these Terms & Conditions, please contact us:"
      }
    },
    hi: {
      title: "नियम और शर्तें",
      subtitle: "कृपया इन नियमों को ध्यान से पढ़ें",
      lastUpdated: "अंतिम अपडेट: 8 नवंबर, 2024",
      agreement: "हमारी वेबसाइट और सेवाओं का उपयोग करके, आप इन नियमों और शर्तों से सहमत होते हैं।",

      sections: {
        acceptance: "नियमों की स्वीकृति",
        acceptanceText: "स्वाद की वेबसाइट और सेवाओं तक पहुंचकर उनका उपयोग करके, आप इन नियमों और शर्तों से बंधने के लिए स्वीकार करते हैं। यदि आप इन नियमों से सहमत नहीं हैं, तो कृपया हमारी वेबसाइट या सेवाओं का उपयोग न करें।",

        ageRestriction: "आयु प्रतिबंध",
        ageText: "हमारे उत्पाद और सेवाएं 18 वर्ष या उससे अधिक आयु के व्यक्तियों के लिए हैं। हमारी वेबसाइट का उपयोग करके, आप पुष्टि करते हैं कि आप कम से कम 18 वर्ष के हैं।",

        products: "उत्पाद और सेवाएं",
        productDescription: "हम व्यक्तिगत उपयोग के लिए डिज़ाइन किए गए वयस्क कल्याण उत्पाद प्रदान करते हैं। सभी उत्पादों का वर्णन यथासंभव सटीक रूप से किया गया है। हम किसी भी सूचना के बिना उत्पाद विवरण, मूल्य, या उपलब्धता को संशोधित करने का अधिकार सुरक्षित रखते हैं।",
        productAvailability: "उत्पाद उपलब्धता परिवर्तन के अधीन है। हम इस बात की गारंटी नहीं देते कि उत्पाद विवरण या रंग सटीक, पूर्ण, विश्वसनीय, वर्तमान, या त्रुटि-मुक्त हैं।",

        pricing: "मूल्य निर्धारण और भुगतान",
        pricingText: "सभी कीमतें भारतीय रुपये (INR) में सूचीबद्ध हैं और सभी लागू करों को शामिल करती हैं। हम किसी भी सूचना के बिना किसी भी समय मूल्य बदलने का अधिकार सुरक्षित रखते हैं।",
        paymentMethods: "हम क्रेडिट/डेबिट कार्ड, UPI, नेट बैंकिंग और कैश ऑन डिलीवरी सहित विभिन्न भुगतान विधियों को स्वीकार करते हैं। सभी भुगतान जानकारी सुरक्षित रूप से संसाधित की जाती है।",

        orders: "ऑर्डर प्रोसेसिंग",
        orderConfirmation: "जब आप ऑर्डर देते हैं, तो आपको ऑर्डर पुष्टि ईमेल प्राप्त होगा। यह आपके ऑर्डर की स्वीकृति की गारंटी नहीं है।",
        orderAcceptance: "हम किसी भी कारण से किसी भी ऑर्डर को अस्वीकार करने या रद्द करने का अधिकार सुरक्षित रखते हैं, जिसमें उत्पाद उपलब्धता, मूल्य निर्धारण में त्रुटियां, या संदिग्ध गतिविधि शामिल हैं।",

        shipping: "शिपिंग और डिलीवरी",
        shippingText: "हम भारत में सभी प्रमुख शहरों और कस्बों में शिप करते हैं। डिलीवरी समय अनुमान हैं और गारंटीकृत नहीं हैं। शिपिंग कैरियर्स या हमारे नियंत्रण से परे अन्य कारकों के कारण होने वाली देरी के लिए हम जिम्मेदार नहीं हैं।",
        deliveryRisk: "इस वेबसाइट पर ऑर्डर किए गए सभी माल के हानि का जोखिम और शीर्षक तब आपके पास स्थानांतरित हो जाता है जब माल शिपिंग कैरियर को डिलीवर कर दिया जाता है।",

        returns: "रिटर्न और रिफंड",
        returnPolicy: "हम मूल पैकेजिंग में अप्रयुक्त उत्पादों के लिए 30-दिन की रिटर्न नीति प्रदान करते हैं। विस्तृत जानकारी के लिए कृपया हमारे शिपिंग और रिटर्न पेज देखें।",
        nonReturnable: "स्वास्थ्य और सुरक्षा नियमों के कारण, कुछ उत्पाद रिटर्न के लिए पात्र नहीं हो सकते हैं। इनमें खोले गए या उपयोग किए गए उत्पाद शामिल हैं।",

        intellectualProperty: "बौद्धिक संपदा",
        ipText: "इस वेबसाइट पर सभी सामग्री, जिसमें पाठ, ग्राफिक्स, लोगो, चित्र और सॉफ्टवेयर शामिल हैं लेकिन इन तक सीमित नहीं हैं, स्वाद की संपत्ति है और बौद्धिक संपदा कानूनों द्वारा संरक्षित है।",

        userConduct: "उपयोगकर्ता आचरण",
        prohibitedActs: "आप सहमत होते हैं कि आप:",
        prohibitedList: "वेबसाइट का उपयोग अवैध उद्देश्यों के लिए नहीं करेंगे, दुर्भावनापूर्ण कोड अपलोड या ट्रांसमिट नहीं करेंगे, अनधिकृत पहुंच प्राप्त करने का प्रयास नहीं करेंगे, किसी भी लागू कानूनों या नियमों का उल्लंघन नहीं करेंगे, अन्य उपयोगकर्ताओं को परेशान या दुर्व्यवहार नहीं करेंगे",

        privacy: "गोपनीयता",
        privacyText: "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। कृपया हमारी गोपनीयता नीति की समीक्षा करें, जो वेबसाइट के आपके उपयोग को भी नियंत्रित करती है, हमारे प्रथाओं को समझने के लिए।",

        disclaimer: "वारंटी की अस्वीकृति",
        warrantyText: "हमारी वेबसाइट और सेवाएं 'जैसी हैं' और 'जैसी उपलब्ध हैं' के आधार पर प्रदान की जाती हैं। हम कोई वारंटी, व्यक्त या निहित, नहीं देते हैं और इस तरह सभी वारंटी को अस्वीकार करते हैं।",

        limitation: "दायित्व की सीमा",
        liabilityText: "किसी भी परिस्थिति में स्वाद, इसके निदेशकों, कर्मचारियों, भागीदारों, एजेंटों, आपूर्तिकर्ताओं, या सहयोगियों किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, या परिणामी नुकसान के लिए उत्तरदायी नहीं होंगे।",

        indemnification: "क्षतिपूर्ति",
        indemnificationText: "आप सहमत होते हैं कि आप हमारी वेबसाइट या सेवाओं के आपके उपयोग से उत्पन्न किसी भी दावे, मांग, या क्षति के लिए स्वाद और इसके सहयोगियों को क्षतिपूर्ति और हानिरहित रखेंगे।",

        termination: "समापन",
        terminationText: "हम अपने विवेक पर, किसी भी कारण से, किसी भी पूर्व सूचना या दायित्व के बिना, तुरंत आपके खाते को समाप्त या निलंबित कर सकते हैं और सेवा तक पहुंच को रोक सकते हैं।",

        changes: "नियमों में परिवर्तन",
        changesText: "हम किसी भी समय इन नियमों को संशोधित करने का अधिकार सुरक्षित रखते हैं। परिवर्तन वेबसाइट पर पोस्ट करते ही तुरंत प्रभावी होंगे।",

        governing: "शासी कानून",
        governingText: "ये नियम भारत के कानूनों के अनुसार शासित और व्याख्या किए जाएंगे, इसके कानून विरोध के प्रावधानों को देखे बिना।",

        dispute: "विवाद समाधान",
        disputeText: "इन नियमों से उत्पन्न कोई भी विवाद परस्पर चर्चा के माध्यम से हल किया जाएगा। यदि कोई समाधान नहीं निकलता है, तो मामला मुंबई, महाराष्ट्र के न्यायालयों के अधिकार क्षेत्र के अधीन होगा।",

        contact: "संपर्क जानकारी",
        contactText: "यदि आपके पास इन नियमों और शर्तों के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:"
      }
    }
  };

  const t = content[language].sections;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{content[language].title}</h1>
            <p className="text-xl text-muted-foreground mb-2">{content[language].subtitle}</p>
            <p className="text-sm text-muted-foreground mb-4">{content[language].lastUpdated}</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{content[language].agreement}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="space-y-8">
            {/* Age Restriction - Important Notice */}
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                  <Badge variant="destructive">18+</Badge>
                  {t.ageRestriction}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.ageText}</p>
              </CardContent>
            </Card>

            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-6 w-6 text-primary" />
                  {t.acceptance}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t.acceptanceText}</p>
              </CardContent>
            </Card>

            {/* Products and Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  {t.products}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.productDescription}</p>
                <div className="bg-secondary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">{t.productAvailability}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing and Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  {t.pricing}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.pricingText}</p>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Accepted Payment Methods:</h4>
                  <p className="text-sm text-muted-foreground">{t.paymentMethods}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  {t.orders}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">{t.orderConfirmation}</p>
                </div>
                <p className="text-muted-foreground">{t.orderAcceptance}</p>
              </CardContent>
            </Card>

            {/* Shipping and Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  {t.shipping}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.shippingText}</p>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <p className="text-sm text-orange-800 dark:text-orange-200">{t.deliveryRisk}</p>
                </div>
              </CardContent>
            </Card>

            {/* Returns and Refunds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {t.returns}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.returnPolicy}</p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{t.nonReturnable}</p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  {t.intellectualProperty}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.ipText}</p>
              </CardContent>
            </Card>

            {/* User Conduct */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {t.userConduct}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{t.prohibitedActs}</p>
                <ul className="space-y-2">
                  {t.prohibitedList.split(', ').map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>{t.privacy}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.privacyText}</p>
              </CardContent>
            </Card>

            {/* Legal Notices */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.disclaimer}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.warrantyText}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.limitation}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.liabilityText}</p>
                </CardContent>
              </Card>
            </div>

            {/* Indemnification */}
            <Card className="bg-orange-50/50 dark:bg-orange-900/10">
              <CardHeader>
                <CardTitle>{t.indemnification}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.indemnificationText}</p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>{t.termination}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.terminationText}</p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-6 w-6 text-primary" />
                  {t.governing}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.governingText}</p>
              </CardContent>
            </Card>

            {/* Dispute Resolution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.dispute}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.disputeText}</p>
              </CardContent>
            </Card>

            {/* Changes */}
            <Card>
              <CardHeader>
                <CardTitle>{t.changes}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.changesText}</p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  {t.contact}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{t.contactText}</p>
                <div className="space-y-2">
                  <p className="text-primary">📧 Email: support@manforcesextoys.in</p>
                  <p className="text-primary">📞 Phone: +91-9876543210</p>
                  <p className="text-primary">🕒 Support Hours: 10 AM – 10 PM</p>
                  <div className="mt-3 p-3 bg-secondary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">
                      {language === "en"
                        ? "NP Wellness is a purely online business. We provide customer support through phone and email only."
                        : "एनपी वेलनेस पूरी तरह से ऑनलाइन व्यवसाय है। हम केवल फोन और ईमेल के माध्यम से ग्राहक सहायता प्रदान करते हैं।"
                      }
                    </p>
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

export default TermsConditions;