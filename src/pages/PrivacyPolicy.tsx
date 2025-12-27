import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Database, Lock, Users, Globe, Cookie, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Privacy Policy",
      subtitle: "Your privacy is our top priority",
      lastUpdated: "Last Updated: November 8, 2024",

      sections: {
        introduction: "Introduction",
        introText: "At Svaad, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and protect your data when you use our website and services.",

        dataCollection: "Information We Collect",
        personalInfo: "Personal Information",
        personalInfoList: "Name, email address, phone number, shipping address, billing information",
        browsingInfo: "Browsing Information",
        browsingInfoList: "IP address, browser type, device information, pages visited, time spent",
        purchaseInfo: "Purchase Information",
        purchaseInfoList: "Products viewed, items in cart, purchase history, payment details",

        dataUsage: "How We Use Your Information",
        usageList: "Process orders and provide customer service, Improve our website and services, Send order updates and promotional communications, Personalize your shopping experience, Prevent fraud and ensure security",

        dataSharing: "Information Sharing",
        sharingText: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.",
        sharingTypes: "Shipping partners for order delivery, Payment processors for transaction processing, Legal authorities when required by law",

        dataSecurity: "Data Security",
        securityText: "We implement industry-standard security measures to protect your personal information:",
        securityList: "SSL encryption for all data transmission, Secure payment processing, Regular security audits, Limited employee access to data",

        cookies: "Cookies and Tracking",
        cookiesText: "We use cookies to enhance your experience:",
        cookieTypes: "Essential cookies for website functionality, Analytics cookies to understand user behavior, Marketing cookies for personalized advertising",

        userRights: "Your Rights",
        rightsList: "Access to your personal data, Correction of inaccurate information, Deletion of your account and data, Opt-out of marketing communications, Data portability",

        retention: "Data Retention",
        retentionText: "We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.",

        international: "International Data Transfers",
        internationalText: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.",

        changes: "Changes to This Policy",
        changesText: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date.",

        contact: "Contact Us",
        contactText: "If you have any questions about this Privacy Policy, please contact us:",

        ageRestriction: "Age Restriction",
        ageText: "Our services are intended for individuals who are 18 years of age or older. We do not knowingly collect personal information from minors under 18 years of age."
      }
    },
    hi: {
      title: "गोपनीयता नीति",
      subtitle: "आपकी गोपनीयता हमारी सर्वोच्च प्राथमिकता है",
      lastUpdated: "अंतिम अपडेट: 8 नवंबर, 2024",

      sections: {
        introduction: "परिचय",
        introText: "स्वाद पर, हम आपकी गोपनीयता की सुरक्षा करने और आपकी व्यक्तिगत जानकारी की सुरक्षा सुनिश्चित करने के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट और सेवाओं का उपयोग करते हैं तो हम आपका डेटा कैसे एकत्र करते हैं, उपयोग करते हैं और उसकी सुरक्षा करते हैं।",

        dataCollection: "जानकारी जो हम एकत्र करते हैं",
        personalInfo: "व्यक्तिगत जानकारी",
        personalInfoList: "नाम, ईमेल पता, फोन नंबर, शिपिंग पता, बिलिंग जानकारी",
        browsingInfo: "ब्राउज़िंग जानकारी",
        browsingInfoList: "आईपी पता, ब्राउज़र प्रकार, डिवाइस जानकारी, देखी गई पृष्ठ, बिताया गया समय",
        purchaseInfo: "खरीदारी जानकारी",
        purchaseInfoList: "देखे गए उत्पाद, कार्ट में आइटम, खरीदारी इतिहास, भुगतान विवरण",

        dataUsage: "हम आपकी जानकारी का उपयोग कैसे करते हैं",
        usageList: "ऑर्डर प्रोसेस करना और ग्राहक सेवा प्रदान करना, हमारी वेबसाइट और सेवाओं में सुधार करना, ऑर्डर अपडेट और प्रचार संचार भेजना, आपके खरीदारी अनुभव को व्यक्तिगत बनाना, धोखाधड़ी को रोकना और सुरक्षा सुनिश्चित करना",

        dataSharing: "जानकारी साझा करना",
        sharingText: "हम आपकी सहमति के बिना तीसरे पक्ष को आपकी व्यक्तिगत जानकारी नहीं बेचते, व्यापार नहीं करते या अन्यथा स्थानांतरित नहीं करते हैं, जब तक कि इस नीति में वर्णित अपवादों को छोड़कर।",
        sharingTypes: "ऑर्डर डिलीवरी के लिए शिपिंग पार्टनर, लेनदेन प्रोसेसिंग के लिए भुगतान प्रोसेसर, कानूनी आवश्यकताओं पर कानूनी अधिकारी",

        dataSecurity: "डेटा सुरक्षा",
        securityText: "हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपायों को लागू करते हैं:",
        securityList: "सभी डेटा ट्रांसमिशन के लिए SSL एन्क्रिप्शन, सुरक्षित भुगतान प्रोसेसिंग, नियमित सुरक्षा ऑडिट, डेटा तक सीमित कर्मचारी पहुंच",

        cookies: "कुकीज और ट्रैकिंग",
        cookiesText: "हम आपके अनुभव को बेहतर बनाने के लिए कुकीज का उपयोग करते हैं:",
        cookieTypes: "वेबसाइट कार्यक्षमता के लिए आवश्यक कुकीज, उपयोगकर्ता व्यवहार को समझने के लिए एनालिटिक्स कुकीज, व्यक्तिगत विज्ञापन के लिए मार्केटिंग कुकीज",

        userRights: "आपके अधिकार",
        rightsList: "आपके व्यक्तिगत डेटा तक पहुंच, अशुद्ध जानकारी का सुधार, आपके खाते और डेटा का विलोपन, मार्केटिंग संचार से ऑप्ट-आउट, डेटा पोर्टेबिलिटी",

        retention: "डेटा प्रतिधारण",
        retentionText: "हम आपकी व्यक्तिगत जानकारी को केवल तब तक रखते हैं जब तक इस नीति में उल्लिखित उद्देश्यों को पूरा करने के लिए आवश्यक हो, जब तक कि कानून द्वारा लंबी प्रतिधारण अवधि की आवश्यकता या अनुमति न हो।",

        international: "अंतर्राष्ट्रीय डेटा ट्रांसफर",
        internationalText: "आपकी जानकारी आपके देश के अलावा अन्य देशों में स्थानांतरित और प्रोसेस की जा सकती है। हम आपके डेटा की सुरक्षा के लिए उचित सुरक्षा उपायों को लागू करना सुनिश्चित करते हैं।",

        changes: "इस नीति में परिवर्तन",
        changesText: "हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। हम इस पृष्ठ पर नई नीति पोस्ट करके और 'अंतिम अपडेट' दिनांक को अपडेट करके किसी भी परिवर्तन के बारे में आपको सूचित करेंगे।",

        contact: "संपर्क करें",
        contactText: "यदि आपके पास इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:",

        ageRestriction: "आयु प्रतिबंध",
        ageText: "हमारी सेवाएं उन व्यक्तियों के लिए हैं जो 18 वर्ष या उससे अधिक आयु के हैं। हम जानबूझकर 18 वर्ष से कम आयु के नाबालिगों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं।"
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
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{content[language].title}</h1>
            <p className="text-xl text-muted-foreground mb-2">{content[language].subtitle}</p>
            <p className="text-sm text-muted-foreground">{content[language].lastUpdated}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="space-y-12">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  {t.introduction}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t.introText}</p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  {t.dataCollection}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">{t.personalInfo}</h3>
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{t.personalInfoList}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">{t.browsingInfo}</h3>
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{t.browsingInfoList}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">{t.purchaseInfo}</h3>
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{t.purchaseInfoList}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {t.dataUsage}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.usageList.split(', ').map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  {t.dataSharing}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.sharingText}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {t.sharingTypes.split(', ').map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                      <Badge variant="outline" className="text-xs">
                        {index === 0 ? 'Delivery' : index === 1 ? 'Payment' : 'Legal'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  {t.dataSecurity}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.securityText}</p>
                <div className="space-y-2">
                  {t.securityList.split(', ').map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-6 w-6 text-primary" />
                  {t.cookies}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t.cookiesText}</p>
                <div className="space-y-2">
                  {t.cookieTypes.split(', ').map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {t.userRights}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.rightsList.split(', ').map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle>{t.retention}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.retentionText}</p>
              </CardContent>
            </Card>

            {/* International Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  {t.international}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.internationalText}</p>
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

            {/* Age Restriction */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-300">
                    18+
                  </Badge>
                  {t.ageRestriction}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.ageText}</p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
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

export default PrivacyPolicy;