import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const Footer = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      about: "About Us (Updated)",
      contact: "Contact",
      privacy: "Privacy Policy (Updated)",
      terms: "Refund Policy (Updated)",
      shipping: "Shipping & Returns",
      tagline: "🖤 Make your nights more exciting - 100% Discreet Delivery",
      copyright: "© 2025 NP Wellness • All Rights Reserved"
    },
    hi: {
      about: "हमारे बारे में (अपडेटेड)",
      contact: "संपर्क करें",
      privacy: "गोपनीयता नीति (अपडेटेड)",
      terms: "रिफंड नीति (अपडेटेड)",
      shipping: "शिपिंग और रिटर्न",
      tagline: "🖤 अपनी रातों को और भी रोमांचक बनाएं - 100% डिस्क्रीट डिलीवरी",
      copyright: "© 2025 एनपी वेलनेस • सर्वाधिकार सुरक्षित"
    }
  };

  const t = content[language];

  return (
    <footer className="bg-secondary/5 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/placeholder.svg"
                alt="NP Wellness"
                className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div>
                <h3 className="text-2xl font-bold text-primary mb-1">
                  {language === "en" ? "NP Wellness" : "एनपी वेलनेस"}
                </h3>
              </div>
            </Link>
            <p className="text-muted-foreground text-center md:text-left">{t.tagline}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {language === "en" ? "Quick Links" : "त्वरित लिंक"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.shipping}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {language === "en" ? "Legal" : "कानूनी"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
