import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "About NP Wellness",
      mission: "Our Mission",
      missionText: "At NP Wellness, we believe that exploring your body and your desires is a natural, beautiful, and essential part of life. Founded in 2025, our mission is to break the taboos surrounding sexual wellness in India. We meticulously curate every product in our collection, ensuring it meets our strict standards for safety, quality, and design.",
      values: "Our Values",
      valuesText: "We are more than just a store; we are your partner in discovery, offering educational resources and a secure, judgment-free space to learn and shop. Your privacy and satisfaction are our top priorities.",
      quality: "Quality Assurance",
      qualityText: "Every product is carefully selected from trusted manufacturers, tested for body-safety, and designed to enhance your intimate wellness journey."
    },
    hi: {
      title: "एनपी वेलनेस के बारे में",
      mission: "हमारा मिशन",
      missionText: "एनपी वेलनेस पर, हमारा मानना है कि अपने शरीर और अपनी इच्छाओं को एक्सप्लोर करना जीवन का एक स्वाभाविक, सुंदर और आवश्यक हिस्सा है। 2025 में स्थापित, हमारा मिशन भारत में यौन कल्याण के आसपास के टैबू को तोड़ना है। हम अपने संग्रह में हर उत्पाद को सुरक्षा, गुणवत्ता और डिजाइन के लिए अपने सख्त मानकों को पूरा करने का आश्वासन देते हुए चुनिंदा तरीके से चुनते हैं।",
      values: "हमारे मूल्य",
      valuesText: "हम सिर्फ एक स्टोर से ज्यादा हैं; हम आपकी खोज में आपके साथी हैं, शैक्षिक संसाधन और सीखने और खरीदारी के लिए एक सुरक्षित, निर्णय-मुक्त स्थान प्रदान करते हैं। आपकी गोपनीयता और संतुष्टि हमारी सर्वोच्च प्राथमिकताएं हैं।",
      quality: "गुणवत्ता आश्वासन",
      qualityText: "प्रत्येक उत्पाद को विश्वसनीय निर्माताओं से सावधानीपूर्वक चुना जाता है, बॉडी-सेफ्टी के लिए परीक्षण किया जाता है, और आपकी आत्मिक कल्याण यात्रा को बढ़ाने के लिए डिज़ाइन किया गया है।"
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t.title}</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">{t.mission}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t.missionText}</p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">{t.values}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t.valuesText}</p>
          </section>
          
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground">{t.quality}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t.qualityText}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
