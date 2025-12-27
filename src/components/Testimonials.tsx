import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

export const Testimonials = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Real reviews",
      subtitle: "View all",
      reviews: [
        {
          name: "SJ",
          text: "I was afraid to buy sex toy because of my experience with fake sites. But, when I landed at NP wellness store, I had to place my order. My order was delayed, so I had to contact their customer service team. They expedited the shipping and I received my order within 2 days with a free gift.",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "Kat",
          text: "NP wellness store has one of its kind and amazing customer support. Ms. Sonia's passion, dedication, and proactiveness ensured my queries were resolved, and even out-of-stock sex toy was delivered promptly. Their after sales service reflects excellence and position them as a market leader.",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "Gurtej",
          text: "NP wellness store is amazing, genuine, and delivers what they promised. There is no need to go to other fraudulent sellers. Prices seem high due to costly import duties. But they work hard to reduce costs, and offers premium adult toys at best prices. Truly, this is the only trustworthy adult brand in India.",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "Sunil",
          text: "NP wellness store's customer support is outstanding, wonderful, and quick. Mr. Manish resolved my query in a very short time period. Their polite behavior and tone made my sex toy shopping experience excellent. I've never seen such customer service, and will confidently continue buying from them.",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "Rishabh",
          text: "NP wellness store excels in every aspect—smooth website, expert support, patient payment assistance, and responsive order tracking. Products are genuine, high-quality, and even rare items are sourced. Despite minor customs delays, they compensated me. After multiple purchases, I'll confidently keep returning.",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "MA",
          text: "Fantastic quality and an amazing experience! Product exceeded my expectations—smooth, long-lasting, and comfortable to use. Discreet packaging and the delivery was fast. NP wellness store values quality and customer satisfaction. Highly recommend to anyone looking for premium sex toys!",
          rating: 4.8,
          totalReviews: 755
        }
      ]
    },
    hi: {
      title: "असली समीक्षाएं",
      subtitle: "सभी देखें",
      reviews: [
        {
          name: "SJ",
          text: "मैं नकली साइटों के साथ अपने अनुभव के कारण सेक्स टॉय खरीदने से डर रहा था। लेकिन, जब मैं एनपी वेलनेस पर उतरा, तो मुझे अपना ऑर्डर देना पड़ा। मेरा ऑर्डर देर से हुआ, इसलिए मुझे उनकी ग्राहक सेवा टीम से संपर्क करना पड़ा। उन्होंने शिपिंग तेज कर दी और मुझे 2 दिनों के भीतर एक मुफ्त उपहार के साथ मेरा ऑर्डर मिला।",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "Kat",
          text: "एनपी वेलनेस के पास अपनी तरह का और अद्भुत ग्राहक समर्थन है। श्रीमती सोनिया के जुनून, समर्पण और सक्रियता ने मेरे प्रश्नों का समाधान सुनिश्चित किया, और यहां तक कि स्टॉक से बाहर सेक्स टॉय भी तुरंत डिलीवर किया गया। उनकी बिक्री के बाद की सेवा उत्कृष्टता को दर्शाती है और उन्हें एक बाजार नेता के रूप में स्थापित करती है।",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "गुरतेज",
          text: "एनपी वेलनेस अद्भुत, वास्तविक, और वादा किया हुआ प्रदान करता है। अन्य धोखाधड़ी विक्रेताओं के पास जाने की कोई आवश्यकता नहीं है। महंगी आयात शुल्क के कारण कीमतें अधिक लग सकती हैं। लेकिन वे लागत को कम करने के लिए कड़ी मेहनत करते हैं, और सर्वोत्तम कीमतों पर प्रीमियम वयस्क टॉय प्रदान करते हैं। सचमुच, यह भारत में एकमात्र भरोसेमंद वयस्क ब्रांड है।",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "सुनील",
          text: "एनपी वेलनेस का ग्राहक समर्थन उत्कृष्ट, अद्भुत, और तेज़ है। श्री मनीष ने बहुत कम समय में मेरी क्वेरी का समाधान किया। उनके विनम्र व्यवहार और टोन ने मेरे सेक्स टॉय खरीदारी अनुभव को उत्कृष्ट बना दिया। मैंने ऐसी ग्राहक सेवा कभी नहीं देखी, और मैं विश्वास से उनसे खरीदना जारी रखूँगा।",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "ऋषभ",
          text: "एनपी वेलनेस हर पहलू में उत्कृष्ट है—चिकनी वेबसाइट, विशेषज्ञ समर्थन, धैर्यवान भुगतान सहायता, और प्रतिक्रियाशील ऑर्डर ट्रैकिंग। उत्पाद वास्तविक, उच्च-गुणवत्ता वाले हैं, और यहां तक कि दुर्लभ आइटम भी सोर्स किए जाते हैं। नाबालिग कस्टम देरी के बावजूद, उन्होंने मुझे मुआवजा दिया। कई खरीदारी के बाद, मैं विश्वास से वापस आता रहूँगा।",
          rating: 4.8,
          totalReviews: 755
        },
        {
          name: "एमए",
          text: "शानदार गुणवत्ता और एक अद्भुत अनुभव! उत्पाद ने मेरी अपेक्षाओं को पार कर दिया—चिकना, लंबे समय तक चलने वाला, और उपयोग करने में आरामदायक। डिस्क्रीट पैकेजिंग और डिलीवरी तेज थी। एनपी वेलनेस गुणवत्ता और ग्राहक संतुष्टि को महत्व देता है। प्रीमियम सेक्स टॉय की तलाश में किसी को भी अत्यधिक अनुशंसा करते हैं!",
          rating: 4.8,
          totalReviews: 755
        }
      ]
    }
  };

  const t = content[language];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t.title}</h2>
          <p className="text-primary text-lg font-medium cursor-pointer hover:underline">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.reviews.map((review, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? 'fill-current' : 'fill-transparent'}`}
                      />
                    ))}
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {language === "en" ? "Verified Buyer" : "सत्यापित खरीदार"}
                  </Badge>
                </div>

                <div className="mb-4">
                  <Quote className="h-8 w-8 text-primary/20 mb-2" />
                  <p className="text-muted-foreground text-sm leading-relaxed italic">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-medium text-foreground">by {review.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Verified Buyer" : "सत्यापित खरीदार"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">Rated {review.rating} / 5</p>
                    <p className="text-xs text-muted-foreground">{review.totalReviews} reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <Star className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-lg text-foreground">
                {language === "en" ? "Join 1,000,000+ Happy Customers" : "1,000,000+ खुश ग्राहकों में शामिल हों"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Trusted by Indians since 2025" : "2025 से भारतीयों द्वारा विश्वस्त"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};