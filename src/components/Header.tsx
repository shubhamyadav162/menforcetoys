import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const content = {
    en: {
      shop: "Shop",
      about: "About",
      contact: "Contact"
    },
    hi: {
      shop: "खरीदें",
      about: "हमारे बारे में",
      contact: "संपर्क करें"
    }
  };

  const t = content[language];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        background: 'transparent',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="NP Wellness"
            className="h-10 w-10 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white drop-shadow-lg">
              {language === "en" ? "NP Wellness" : "एनपी वेलनेस"}
            </h1>
            <span className="text-xs text-white/90 drop-shadow-md">
              {language === "en" ? "🖤 Adult wellness" : "🖤 वयस्क कल्याण"}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/shop" className="text-white hover:text-yellow-300 transition-all duration-300 font-medium drop-shadow-md hover:drop-shadow-lg">
            {t.shop}
          </Link>
          <Link to="/about" className="text-white hover:text-yellow-300 transition-all duration-300 font-medium drop-shadow-md hover:drop-shadow-lg">
            {t.about}
          </Link>
          <Link to="/contact" className="text-white hover:text-yellow-300 transition-all duration-300 font-medium drop-shadow-md hover:drop-shadow-lg">
            {t.contact}
          </Link>
        </nav>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="font-medium text-white hover:text-yellow-300 hover:bg-white/10 drop-shadow-md"
          >
            {language === "en" ? "हिंदी" : "EN"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:text-yellow-300 hover:bg-white/10 drop-shadow-md"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};
