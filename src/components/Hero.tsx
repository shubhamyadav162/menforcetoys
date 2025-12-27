import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      headline: "🖤 NP Wellness",
      subheadline: "Make your nights even more exciting – 100% Discreet Delivery",
      features: "⚡ Limited Stock – Order Today",
      features2: "🔒 Private Packaging – No one will know",
      features3: "🚚 Fast Delivery – Service across India",
      features4: "⭐ 4.9/5 Rating – Thousands of happy customers",
      features5: "🛡 7 Day Replacement – Damaged products will be replaced",
      features6: "💳 GPay / PhonePe / Paytm / UPI – Payment Mode",
      cta: "🔥 Order Now"
    },
    hi: {
      headline: "🖤 एनपी वेलनेस",
      subheadline: "अपनी रातों को बनाइए और भी रोमांचक – 100% डिस्क्रीट डिलीवरी",
      features: "⚡ लिमिटेड स्टॉक – आज ही ऑर्डर करें",
      features2: "🔒 प्राइवेट पैकिंग – किसी को पता नहीं चलेगा",
      features3: "🚚 फास्ट डिलीवरी – पूरे इंडिया में सेवा",
      features4: "⭐ 4.9/5 रेटिंग – हज़ारों खुश ग्राहक",
      features5: "🛡 7 दिन Replacement – डैमेज्ड प्रोडक्ट बदला जाएगा",
      features6: "💳 GPay / PhonePe / Paytm / UPI – Payment Mode",
      cta: "🔥 जल्दी ऑर्डर करें"
    }
  };

  const t = content[language];

  return (
    <section
      className="relative min-h-[800px] flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: 'url("/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-pulse animate-gradient bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
            {t.headline}
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-semibold leading-relaxed text-white/95 animate-fade-in">
            {t.subheadline}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <p className="text-lg font-medium text-white">{t.features}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <p className="text-lg font-medium text-white">{t.features2}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-md rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <p className="text-lg font-medium text-white">{t.features3}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-yellow-500/20 backdrop-blur-md rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <p className="text-lg font-medium text-white">{t.features4}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <p className="text-lg font-medium text-white">{t.features5}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <p className="text-lg font-medium text-white">{t.features6}</p>
            </div>
          </div>

          <Link to="/shop">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold px-12 py-6 text-xl shadow-2xl transform hover:scale-110 transition-all duration-300 animate-bounce">
              {t.cta}
            </Button>
          </Link>

          <div className="mt-8 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 backdrop-blur-md rounded-xl p-6 border border-yellow-400/40 max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
            <p className="text-yellow-200 font-medium text-lg">
              {language === "en" ? "🛡️ Delivery is discreet, you can pay securely." : "🛡️ डिलीवरी डिस्क्रीट है, आप सुरक्षित रूप से पेमेंट कर सकते हैं।"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
