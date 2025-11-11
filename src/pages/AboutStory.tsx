import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Award, Users, Globe, Target, Sparkles } from "lucide-react";

export const AboutStory = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "About NP Wellness",
      subtitle: "The Leader in the Online Sex Toys Market in India",
      tagline: "NP Wellness in literal sense means 'Shameless', but in spirit it means freedom & self-belief to express your thoughts, feelings and emotions.",

      storyTitle: "Our Story",
      storyText1: "If you are reading this, there is a 99.99% chance you heard it. And if you did, you know we are naughty by nature, a bit shy out in the streets but quite the opposite in our sheets. NP Wellness, the brand came to life to be your wingman/woman and be the wind beneath your flight. You know, Yeh dil maange more.",

      storyText2: "We the founders, Salim & Raj were never friends. But we shared a similar journey. Growing up in the 80's, our funda was all about rock and roll, riding our bikes, hanging out with friends, occasional splurges like a Levis Red Label, a KingFisher or a Cheeseburger.. flirting was cool and if you landed a date, you had 'made it' in high school. Life was pretty chill and tension free as we called it.",

      storyText3: "But after an embarrassing situation amongst a bunch of friends, Raj was shamed about masturbation and made to feel like an outcast. He felt terrible and guilty, skipped college for months and performed terribly in his exams thereby flunking his finals. The school year ended, he dropped out and moved to US but the guilt and feeling of being shamed left an deep and dark memory for him.",

      storyText4: "FastForward to 2012, We had moved to the US, got busy with our lives and doing well for ourselves, but deep in our hearts, we felt constantly drawn back to our homeland. Bollywood movies, Indian food and festivals kept us in touch with Indian culture but that didnt seem enough. Then one day a phone call with a close friend from India changed it all.",

      storyText5: "During the call, the single word that came up 7 times in this conversation was 'shame'. It instantly transported us back to our growing up days where the feeling of 'shame' and the scare of 'being shamed' was so powerful it impacted our confidence, as well as our ability to believe in ourselves. Looking back, we realized our lives would have shaped up differently had someone separated shame from fear and stigma. With an (impossible) mission that was activated inside our minds and then a chance encounter with Sunny Leone the next day, we figured what we were destined to do.",

      storyText6: "We had to change the name of this game. And this gave birth to 'NP Wellness' - The anti-shame movement.",

      mission: "Our Mission",
      missionText: "Our mission was to normalize sexual pleasure by challenging the stigma and taboo surrounding it, separating sensibilities from shame, and advocating for a new progressive India where individuals respect and accept each other's expressions, preferences, gender & sexual orientation.",

      achievementsTitle: "Our Achievements",
      achievements: [
        "Launched in 2013 to be the first Adult Webstore in India",
        "Delivered over 1 Million orders",
        "Featured in over 200 media outlets like Times of India, YourStory, Economic Times",
        "Over 110,000 Real Customer Reviews online",
        "Over 400,000 followers in our social media community",
        "Won XBIZ Online Retailer of the Year award",
        "120+ International & Indian Brands",
        "2000+ premium sex toys in our India warehouse"
      ],

      commitmentTitle: "Our Commitment",
      commitmentText: "At NP Wellness, we are passionate about promoting sexual wellness and creating a positive impact in people's lives. We strive to foster a safe, inclusive, and non-judgmental environment where you can explore your options and enhance your sexual pleasure and experience."
    },
    hi: {
      title: "एनपी वेलनेस के बारे में",
      subtitle: "भारत में ऑनलाइन सेक्स टॉय बाजार के नेता",
      tagline: "एनपी वेलनेस का शाब्दिक अर्थ 'बेशर्म' है, लेकिन भाव में इसका मतलब स्वतंत्रता और आत्म-विश्वास है अपने विचारों, भावनाओं और भावनाओं को व्यक्त करने के लिए।",

      storyTitle: "हमारी कहानी",
      storyText1: "यदि आप यह पढ़ रहे हैं, तो 99.99% संभावना है कि आपने इसे सुना है। और यदि आपने सुना है, तो आप जानते हैं कि हम स्वभाव से नॉटी हैं, सड़कों पर थोड़े शर्मीले लेकिन हमारी चादरों में बिल्कुल उलट। एनपी वेलनेस, ब्रांड आपके विंगमैन/विंगवूमन बनने के लिए जीवन में आया और आपकी उड़ान के नीचे हवा बनना। आप जानते हैं, यह दिल मांगे और।",

      storyText2: "हम संस्थापक, सलीम और राज कभी दोस्त नहीं थे। लेकिन हमारी यात्रा समान थी। 80 के दशक में पलते हुए, हमारा फंडा रॉक एंड रोल, बाइक चलाना, दोस्तों के साथ समय बिताना, कभी-कभी Levis Red Label, KingFisher या Cheeseburger जैसी चीजों पर खर्च करना.. फ्लर्ट करना अच्छा था और यदि आपको डेट मिला, तो आपने हाई स्कूल में 'बना लिया' था। जीवन काफी शांत और तनाव मुक्त था जैसा हमने कहा।",

      storyText3: "लेकिन दोस्तों के एक समूह के बीच एक शर्मनाक स्थिति के बाद, राज को हस्तमैथुन के लिए शर्मिंदा किया गया और बहिष्कार की तरह महसूस कराया गया। उसे बहुत बुरा और दोषी महसूस हुआ, महीनों के लिए कॉलेज छोड़ दिया और अपनी परीक्षाओं में भयानक प्रदर्शन किया, जिससे वह अपने फाइनल में असफल रहा। स्कूल वर्ष समाप्त हो गया, उसने छोड़ दिया और US चला गया लेकिन अपराध बोध और शर्मिंदा होने की भावना उसके लिए एक गहरी और अंधी याद छोड़ गई।",

      storyText4: "फास्टफॉरवर्ड 2012, हम US चले गए थे, अपने जीवन में व्यस्त और खुद के लिए अच्छा कर रहे थे, लेकिन अपने दिलों की गहराइयों में, हम लगातार अपनी मातृभूमि की ओर खिंचे महसूस करते थे। बॉलीवुड फिल्में, भारतीय भोजन और त्योहार हमें भारतीय संस्कृति से जोड़े रखे लेकिन वह पर्याप्त नहीं लगा। तब एक दिन भारत के एक करीबी दोस्त के साथ फोन पर बातचीत ने सब कुछ बदल दिया।",

      storyText5: "इस बातचीत के दौरान, 'शर्म' शब्द 7 बार आया। यह तुरंत हमें अपने बढ़ते दिनों में वापस ले गया जहां 'शर्म' की भावना और 'शर्मिंदा' होने का डर इतना शक्तिशाली था कि इसने हमारे आत्मविश्वास को प्रभावित किया, साथ ही हमारे खुद पर विश्वास करने की क्षमता को भी। पीछे मुड़कर देखते हुए, हमने महसूस किया कि हमारा जीवन अलग तरीके से आकार लेता यदि किसी ने शर्म को डर और कलंक से अलग कर दिया होता। हमारे दिमाग में सक्रिय हुए एक (असंभव) मिशन के साथ और अगले दिन सनी लियोन के साथ एक संयोग के साथ, हमने समझा कि हम क्या करने के लिए नियत थे।",

      storyText6: "हमें इस खेल का नाम बदलना था। और इसने 'एनपी वेलनेस' को जन्म दिया - एंटी-शेम मूवमेंट।",

      mission: "हमारा मिशन",
      missionText: "हमारा मिशन सेक्सुअल प्लेजर को सामान्य बनाना था, इसके आसपास के कलंक और टैबू को चुनौती देकर, संवेदनशीलता को शर्म से अलग करके, और एक नए प्रगतिशील भारत की वकालत करने के लिए जहां व्यक्ति एक दूसरे के अभिव्यक्तियों, प्राथानिकताओं, लैंगिक और यौन अभिविन्यास का सम्मान और स्वीकार करते हैं।",

      achievementsTitle: "हमारी उपलब्धियां",
      achievements: [
        "2013 में भारत में पहला एडल्ट वेबस्टोर लॉन्च किया",
        "1 मिलियन से अधिक ऑर्डर डिलीवर किए",
        "टाइम्स ऑफ इंडिया, योरस्टोरी, इकोनॉमिक टाइम्स जैसे 200+ मीडिया आउटलेट में चित्रित",
        "ऑनलाइन 110,000+ असली ग्राहक समीक्षाएं",
        "हमारे सोशल मीडिया समुदाय में 400,000+ फॉलोअर्स",
        "एक्सबिज़ ऑनलाइन रिटेलर ऑफ द ईयर अवार्ड जीता",
        "120+ अंतर्राष्ट्रीय और भारतीय ब्रांड",
        "हमारे भारत गोदाम में 2000+ प्रीमियम सेक्स टॉय"
      ],

      commitmentTitle: "हमारी प्रतिबद्धता",
      commitmentText: "एनपी वेलनेस पर, हम लोगों के जीवन में सकारात्मक प्रभाव डालने और सेक्सुअल कल्याण को बढ़ावा देने के लिए उत्साहित हैं। हम एक सुरक्षित, समावेशी और गैर-निर्णायक वातावरण बनाने का प्रयास करते हैं जहां आप अपने विकल्पों का पता लगा सकते हैं और अपने यौन आनंद और अनुभव को बढ़ा सकते हैं।"
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t.title}</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">{t.subtitle}</p>
            <div className="bg-primary/5 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-muted-foreground italic">{t.tagline}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Story Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary" />
                {t.storyTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{t.storyText1}</p>
              <p className="text-muted-foreground leading-relaxed">{t.storyText2}</p>
              <p className="text-muted-foreground leading-relaxed">{t.storyText3}</p>
              <p className="text-muted-foreground leading-relaxed">{t.storyText4}</p>
              <p className="text-muted-foreground leading-relaxed">{t.storyText5}</p>
              <div className="bg-primary/5 rounded-lg p-4 mt-6">
                <p className="text-primary font-semibold">{t.storyText6}</p>
              </div>
            </CardContent>
          </Card>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                {t.mission}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t.missionText}</p>
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                {t.achievementsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {t.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-secondary/10 rounded-lg">
              <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-primary">1M+</h3>
              <p className="text-muted-foreground text-sm">
                {language === "en" ? "Happy Customers" : "खुश ग्राहक"}
              </p>
            </div>
            <div className="text-center p-6 bg-secondary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-primary">400K+</h3>
              <p className="text-muted-foreground text-sm">
                {language === "en" ? "Social Followers" : "सोशल फॉलोअर्स"}
              </p>
            </div>
            <div className="text-center p-6 bg-secondary/10 rounded-lg">
              <Award className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-primary">200+</h3>
              <p className="text-muted-foreground text-sm">
                {language === "en" ? "Media Mentions" : "मीडिया उल्लेख"}
              </p>
            </div>
            <div className="text-center p-6 bg-secondary/10 rounded-lg">
              <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-primary">110K+</h3>
              <p className="text-muted-foreground text-sm">
                {language === "en" ? "Real Reviews" : "असली समीक्षाएं"}
              </p>
            </div>
          </div>

          {/* Commitment Section */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary" />
                {t.commitmentTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t.commitmentText}</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutStory;