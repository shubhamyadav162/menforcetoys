import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Shield, Truck, Star } from "lucide-react";

export const FAQ = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "❓ Frequently Asked Questions",
      subtitle: "Everything you need to know about our products and services",

      faqs: [
        {
          question: "Is delivery secret?",
          answer: "Yes ✅ Packaging is absolutely plain, no one will know."
        },
        {
          question: "Are the products safe?",
          answer: "Yes ✅ All products are made from skin-friendly materials."
        },
        {
          question: "Is delivery available all over India?",
          answer: "Yes ✅ We provide Pan-India service."
        }
      ],

      customerSupport: {
        title: "📞 Customer Care Support",
        subtitle: "We are always available for you.",
        phone: "📱 Call: +91-9876543210",
        email: "📧 Email: support@manforcesextoys.in",
        timing: "🕒 Time: 10 AM – 10 PM"
      }
    },
    hi: {
      title: "❓ अक्सर पूछे जाने वाले सवाल",
      subtitle: "हमारे उत्पादों और सेवाओं के बारे में जानने के लिए आपको जो कुछ भी जानना है",

      faqs: [
        {
          question: "क्या डिलीवरी सीक्रेट रहती है?",
          answer: "जी हाँ ✅ पैकिंग बिलकुल plain होती है, किसी को पता नहीं चलता।"
        },
        {
          question: "क्या प्रोडक्ट सुरक्षित है?",
          answer: "हाँ ✅ सारे प्रोडक्ट skin-friendly मटेरियल से बने हैं।"
        },
        {
          question: "क्या पूरे इंडिया में डिलीवरी होती है?",
          answer: "हाँ ✅ हम पैन-इंडिया सर्विस देते हैं।"
        }
      ],

      customerSupport: {
        title: "📞 कस्टमर केयर सपोर्ट",
        subtitle: "हम हमेशा आपके लिए उपलब्ध हैं।",
        phone: "📱 कॉल: +91-9876543210",
        email: "📧 ईमेल: support@manforcesextoys.in",
        timing: "🕒 समय: सुबह 10 बजे – रात 10 बजे तक"
      }
    }
  };

  const t = content[language];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* FAQ Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t.title}</h2>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {t.faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer Support Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              {t.customerSupport.title}
            </CardTitle>
            <p className="text-muted-foreground text-lg">{t.customerSupport.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="font-medium text-lg mb-2">{t.customerSupport.phone}</p>
                <Badge variant="outline" className="text-xs">
                  24/7 Available
                </Badge>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="font-medium text-lg mb-2">{t.customerSupport.email}</p>
                <Badge variant="outline" className="text-xs">
                  Quick Response
                </Badge>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="font-medium text-lg mb-2">{t.customerSupport.timing}</p>
                <Badge variant="outline" className="text-xs">
                  Business Hours
                </Badge>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="text-left">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                    {language === "en" ? "100% Customer Satisfaction" : "100% ग्राहक संतुष्टि"}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {language === "en" ? "Thousands of happy customers trust us" : "हजारों खुश ग्राहक हमें विश्वास करते हैं"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};