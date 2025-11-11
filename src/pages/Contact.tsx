import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";

const Contact = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Customer Care Support",
      subtitle: "We're always here for you. Reach out anytime with your questions.",
      name: "Your Name",
      email: "Your Email",
      message: "Your Message",
      send: "Send Message",
      info: "📞 Customer Care Support",
      emailLabel: "📧 Email",
      phoneLabel: "📱 Call",
      hoursLabel: "🕒 Support Hours",
      supportEmail: "support@manforcesextoys.in",
      supportPhone: "+91-9876543210",
      supportHours: "10 AM – 10 PM"
    },
    hi: {
      title: "कस्टमर केयर सपोर्ट",
      subtitle: "हम हमेशा आपके लिए उपलब्ध हैं। अपने प्रश्नों के साथ किसी भी समय संपर्क करें।",
      name: "आपका नाम",
      email: "आपका ईमेल",
      message: "आपका संदेश",
      send: "संदेश भेजें",
      info: "📞 कस्टमर केयर सपोर्ट",
      emailLabel: "📧 ईमेल",
      phoneLabel: "📱 कॉल",
      hoursLabel: "🕒 समय",
      supportEmail: "support@manforcesextoys.in",
      supportPhone: "+91-9876543210",
      supportHours: "सुबह 10 बजे – रात 10 बजे तक"
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t.title}</h1>
            <p className="text-lg text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-primary" />
                {t.send}
              </h2>
              <form className="space-y-4">
                <div>
                  <Input placeholder={t.name} className="w-full" />
                </div>
                <div>
                  <Input type="email" placeholder={t.email} className="w-full" />
                </div>
                <div>
                  <Textarea placeholder={t.message} className="w-full min-h-[150px]" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  {t.send}
                </Button>
              </form>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center">
                <Mail className="w-6 h-6 mr-2 text-primary" />
                {t.info}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t.phoneLabel}</h3>
                  <a href="tel:+919876543210" className="text-primary hover:underline text-lg font-medium">
                    {t.supportPhone}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t.emailLabel}</h3>
                  <a href="mailto:support@manforcesextoys.in" className="text-primary hover:underline text-lg font-medium">
                    {t.supportEmail}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t.hoursLabel}</h3>
                  <p className="text-muted-foreground text-lg">
                    {t.supportHours}
                  </p>
                </div>
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "We are a purely online business. All support is provided through phone and email."
                      : "हम पूरी तरह से ऑनलाइन व्यवसाय हैं। सभी सपोर्ट फोन और ईमेल के माध्यम से प्रदान किया जाता है।"
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
