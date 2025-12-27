import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Award, TrendingUp } from "lucide-react";

export const MediaMentions = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "In the news",
      subtitle: "As featured in leading media outlets",
      mentions: [
        {
          outlet: "Deccan Herald",
          title: "Leader in organised sex toy market",
          date: "20 Nov 2023",
          category: "Business News"
        },
        {
          outlet: "YourStory",
          title: "India's biggest online adult toy store",
          date: "3 Mar 2022",
          category: "Startup News"
        },
        {
          outlet: "GQ",
          title: "Vast catalogue of Premium Sex Toys",
          date: "28 Jul 2021",
          category: "Lifestyle"
        }
      ],
      storyTitle: "The Sex Toys Story",
      storySubtitle: "What is the big deal about Sex Toys in India?",
      storyText1: "Its no surprise that everyone loves sex, be it with a partner and with yourself (masturbation/self pleasure). We know that's not what you came here to find. But what if we told you that just by using a sex toy and/or lube during sex or masturbation, you can multiply your pleasure, feel it deeper, experience newer sensations in your body and discover zones you never knew existed all while coming to an ultimate toe curling climax that runs through your spine all the way to your brain, will you be mind blown? We figured you'd be.",
      storyText2: "Now, imagine our population (yes we surpassed China in 2022) which explains our fascination for sex, combined with our discreet rendezvous with porn (we are second largest consumer) who wouldn't love the idea of experimenting with sex toys like vibrators, massagers, dildos, butt plugs, masturbators, penis rings and more. For the adventurous, kinky stuff like handcuffs, blindfolds, spankers, mouth gags and anal toys have been widely searched and sought after online.",
      storyText3: "So yes, Sex Toys in India are a BIG DEAL!"
    },
    hi: {
      title: "समाचारों में",
      subtitle: "प्रमुख मीडिया आउटलेट में चित्रित",
      mentions: [
        {
          outlet: "डेक्कन हेराल्ड",
          title: "संगठित सेक्स टॉय बाजार में नेता",
          date: "20 नवंबर 2023",
          category: "व्यापार समाचार"
        },
        {
          outlet: "योरस्टोरी",
          title: "भारत का सबसे बड़ा ऑनलाइन एडल्ट टॉय स्टोर",
          date: "3 मार्च 2022",
          category: "स्टार्टअप समाचार"
        },
        {
          outlet: "GQ",
          title: "प्रीमियम सेक्स टॉय का विशाल कैटलॉग",
          date: "28 जुलाई 2021",
          category: "जीवनशैली"
        }
      ],
      storyTitle: "सेक्स टॉय की कहानी",
      storySubtitle: "भारत में सेक्स टॉय क्या बड़ी बात है?",
      storyText1: "यह कोई आश्चर्य की बात नहीं है कि हर कोई सेक्स पसंद करता है, चाहे यह किसी के साथ हो या अपने साथ (हस्तमैथुन/आत्म-आनंद)। हम जानते हैं कि यह वह नहीं है जो आप यहाँ ढूंढने आए थे। लेकिन क्या होगा यदि हम आपको बताएं कि सिर्फ सेक्स के दौरान या हस्तमैथुन के दौरान सेक्स टॉय और/या ल्यूब्रिकेंट का उपयोग करके, आप अपने आनंद को गुणा कर सकते हैं, इसे गहरा महसूस कर सकते हैं, अपने शरीर में नई संवेदनाओं का अनुभव कर सकते हैं और ऐसे क्षेत्रों की खोज कर सकते हैं जिनके बारे में आपको पहले कभी पता नहीं था, जबकि अंतिम पैर की उंगलियों को मोड़ने वाले क्लाइमैक्स का अनुभव करते हैं जो आपकी रीढ़ की हड्डी से होकर आपके दिमाग तक जाता है, क्या आप हैरान रह जाएंगे? हमने सोचा था कि आप होंगे।",
      storyText2: "अब, हमारी आबादी की कल्पना करें (हाँ, हमने 2022 में चीन को पीछे छोड़ दिया) जो सेक्स के प्रति हमारे जुनून को समझाती है, जो पोर्नोग्राफी के साथ हमारे गुप्त मिलनों के साथ मिलाकर (हम दूसरे सबसे बड़े उपभोक्ता हैं) कौन सेक्स टॉय जैसे वाइब्रेटर, मसाजर, डिल्डो, बट प्लग, मास्टर्बेटर, पेनिस रिंग और बहुत कुछ के साथ प्रयोग करने के विचार से प्यार नहीं करेगा। साहसी लोगों के लिए, हैंडकफ, ब्लाइंडफोल्ड, स्पैंकर, माउथ गैग और एनल टॉय जैसी किंकी चीजें ऑनलाइन व्यापक रूप से खोजी और मांगी गई हैं।",
      storyText3: "तो हाँ, भारत में सेक्स टॉय एक बड़ी बात है!"
    }
  };

  const t = content[language];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Media Mentions Grid */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t.title}</h2>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {t.mentions.map((mention, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {mention.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{mention.date}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{mention.outlet}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{mention.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* The Sex Toys Story Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t.storyTitle}</h2>
              <p className="text-xl text-muted-foreground">{t.storySubtitle}</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">{t.storyText1}</p>
              <p className="text-muted-foreground text-lg leading-relaxed">{t.storyText2}</p>
              <p className="text-muted-foreground text-lg leading-relaxed font-semibold">{t.storyText3}</p>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  {language === "en" ? "1M+ Happy Customers" : "1M+ खुश ग्राहक"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Across India" : "पूरे भारत में"}
                </p>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  {language === "en" ? "200+ Media Mentions" : "200+ मीडिया उल्लेख"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "National Coverage" : "राष्ट्रीय कवरेज"}
                </p>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <Newspaper className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  {language === "en" ? "11+ Years in Business" : "11+ वर्षों से व्यवसाय में"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Trusted Brand" : "विश्वसनीय ब्रांड"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};