import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Shield, Package, Heart, Users, Globe, Clock, CheckCircle } from "lucide-react";

export const ComprehensiveFAQ = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "TOP QUESTIONS RELATED TO SEX TOYS IN INDIA ANSWERED",
      subtitle: "Everything you need to know about buying sex toys in India",

      sections: [
        {
          title: "Getting Started",
          icon: <HelpCircle className="h-5 w-5" />,
          questions: [
            {
              q: "Where to buy sex toys in India?",
              a: "NP wellness store is the best online store that has the largest range of sex toys for men, women and couples online in India. We have been in business for over a decade, delivered over 1,000,000+ orders to almost every city, town and district in India. We offer fast shipping, discreet delivery, and multiple payment options including UPI, credit/debit cards, wallets, crypto as well as COD."
            },
            {
              q: "It's my first time shopping for sex toys, I am worried",
              a: "We can relate. We understand and we got your back. NP wellness store has built a solid reputation with over 1M+ customers. Plus - online shopping for vibrators, dildos, massagers, masturbators or BDSM toys is not as complex as you may imagine. We offer great pre-sales & post sales support, a 7 days return policy, 15 days warranty policy and additionally 100% Money back guarantee."
            },
            {
              q: "Is NP wellness store a trusted sex store in India?",
              a: "Yes! We are India's most trusted and loved one stop shop for intimate and pleasure products for over a decade. We built our company with one simple focus: Deliver exceptional customer service, only the most premium adult brands and make it easy and safe for anyone to shop at our store. We guarantee 100% Safe Shopping, Best Priced Sex Toys, Guaranteed Delivery, and Top Class Customer Service."
            }
          ]
        },
        {
          title: "Products & Categories",
          icon: <Package className="h-5 w-5" />,
          questions: [
            {
              q: "Which are the most popular sex toys for men in India?",
              a: "The most popular sex toys for men are Fleshlights, Hustler masturbators, Tenga Cups and various types of Sex Dolls. The masturbators are most commonly known as fleshlight, cups, pocket pussy or strokers. Other popular options include cock rings for extended erection and prostate massagers for P-spot stimulation. For beginners, we recommend keeping a budget of Rs3000 to try an entry level masturbator."
            },
            {
              q: "Which are the most popular sex toys for women in India?",
              a: "Without doubt, the most popular sex toy for women is the 'Vibrator'. We have a HUGE collection of vibrators that vibrate, suck, flick and tease; large, small and mini, in various shapes like bullets, eggs, rabbit vibrators. The second most popular are Dildos for penetrative pleasure. From our data, the top 10 include Fifty Shades G-Spot Rabbit Vibrator, Satisfyer Pro 2 Pressure Wave Vibrator, and Lovense Lush Vibrator."
            },
            {
              q: "Which are the most popular sex toys for couples in India?",
              a: "Sex toys for couples are designed to enhance pleasure during sex. Popular options include Satisfyer Partner Plus that can be worn by the female during intercourse, remote-controlled panty vibrators for public play, and vibrating love rings. For long-distance relationships, we recommend Lovense and Kiiroo brands that allow partners to control each other's toys through apps."
            }
          ]
        },
        {
          title: "Privacy & Security",
          icon: <Shield className="h-5 w-5" />,
          questions: [
            {
              q: "What About Privacy and Packaging?",
              a: "We guarantee 100% privacy of your user data and discreet packaging of your orders. There is nothing on the outside that reveals what is inside, not even our name. We pack our orders in a very basic white box, label it with no mention of our website or contents. Your business stays yours. Nobody, not your neighbours, your mom, or your nosy roommate will have any idea what's inside."
            },
            {
              q: "Is it legal to buy sex toys in India?",
              a: "Yes, it is completely legal to buy sex toys in India as long as you are buying it ONLINE. We have been selling them since 2025. The products sold are categorized as multi-function devices, massagers, and wellness products. The products are shipped discreetly, and the packaging does NOT have any nudity or obscenity. As per recent court judgments, adult toys for personal use are completely legal."
            }
          ]
        },
        {
          title: "Shipping & Delivery",
          icon: <Globe className="h-5 w-5" />,
          questions: [
            {
              q: "How does Same Day or 24-Hour Delivery work?",
              a: "Same Day Delivery offers delivery on the same day you ordered, as long as you made FULL payment by 4pm IST (M-F). This option is offered ONLY in Delhi/NCR region. 24-Hour Delivery offers delivery in 24 hours or under in MOST metros like Mumbai, Bengaluru, Delhi/NCR, Chennai, Kolkata, Hyderabad, Pune and others."
            },
            {
              q: "What about shipping charges?",
              a: "FREE Shipping Across India for all orders over Rs. 1000. Typically, deliveries take about 2 to 3 business days for metro cities and 2 to 6 business days for non-metro cities. Express Shipping (2 to 4 business days) is available for Metro Cities and can be selected at checkout."
            },
            {
              q: "I chose Cash on Delivery. Can I pay online now instead?",
              a: "Yes, you can. But, it depends on the status of your order. If your order has not been shipped, we can change the payment mode from 'Cash on Delivery' to 'Prepaid'. You need to contact our customer service team immediately. If your order has already been shipped, we cannot change the payment mode."
            }
          ]
        }
      ]
    },
    hi: {
      title: "भारत में सेक्स टॉय से संबंधित शीर्ष प्रश्नों के उत्तर",
      subtitle: "भारत में सेक्स टॉय खरीदने के बारे में जानने के लिए आपको जो कुछ भी जानना है",

      sections: [
        {
          title: "शुरुआत करना",
          icon: <HelpCircle className="h-5 w-5" />,
          questions: [
            {
              q: "भारत में सेक्स टॉय कहां से खरीदें?",
              a: "एनपी वेलनेस भारत में पुरुषों, महिलाओं और जोड़ों के लिए सेक्स टॉय की सबसे बड़ी रेंज वाला सर्वश्रेष्ठ ऑनलाइन स्टोर है। हम एक दशक से अधिक समय से व्यवसाय में हैं, भारत के हर शहर, कस्बे और जिले में 1,000,000+ से अधिक ऑर्डर डिलीवर किए हैं। हम तेज शिपिंग, डिस्क्रीट डिलीवरी, और कई भुगतान विकल्प प्रदान करते हैं जिसमें UPI, क्रेडिट/डेबिट कार्ड, वॉलेट, क्रिप्टो और साथ ही COD शामिल है।"
            },
            {
              q: "मेरे लिए सेक्स टॉय खरीदना पहली बार है, मैं चिंतित हूं",
              a: "हम संबंधित हो सकते हैं। हम समझते हैं और हमने आपका साथ दिया है। एनपी वेलनेस ने 1M+ ग्राहकों के साथ एक ठोस प्रतिष्ठा बनाई है। साथ ही - वाइब्रेटर, डिल्डो, मसाजर, मास्टर्बेटर या BDSM टॉय के लिए ऑनलाइन खरीदारी उतनी जटिल नहीं है जितनी आप कल्पना कर सकते हैं। हम बेहतरीन प्री-सेल्स और पोस्ट-सेल्स समर्थन, 7 दिन की रिटर्न पॉलिसी, 15 दिन की वारंटी पॉलिसी और अतिरिक्त रूप से 100% मनी बैक गारंटी प्रदान करते हैं।"
            },
            {
              q: "क्या एनपी वेलनेस भारत में एक विश्वसनीय सेक्स स्टोर है?",
              a: "हाँ! हम एक दशक से अधिक समय से अंतरंग और आनंद उत्पादों के लिए भारत का सबसे विश्वसनीय और प्रिय वन-स्टॉप शॉप हैं। हमने अपनी कंपनी को एक सरल फोकस के साथ बनाया: असाधारण ग्राहक सेवा प्रदान करें, केवल सबसे प्रीमियम एडल्ट ब्रांड और हमारे स्टोर पर खरीदना किसी के लिए भी आसान और सुरक्षित बनाएं। हम 100% सुरक्षित खरीदारी, सर्वोत्तम मूल्यित सेक्स टॉय, गारंटीड डिलीवरी, और टॉप क्लास ग्राहक सेवा की गारंटी देते हैं।"
            }
          ]
        },
        {
          title: "उत्पाद और श्रेणियां",
          icon: <Package className="h-5 w-5" />,
          questions: [
            {
              q: "भारत में पुरुषों के लिए सबसे लोकप्रिय सेक्स टॉय कौन से हैं?",
              a: "पुरुषों के लिए सबसे लोकप्रिय सेक्स टॉय फ्लेशलाइट, हस्टलर मास्टर्बेटर, टेंगा कप और विभिन्न प्रकार के सेक्स डॉल हैं। मास्टर्बेटर को आमतौर पर फ्लेशलाइट, कप, पॉकेट पुसी या स्ट्रोकर के रूप में जाना जाता है। अन्य लोकप्रिय विकल्पों में विस्तारित इरेक्शन के लिए कॉक रिंग और P-स्पॉट उत्तेजना के लिए प्रोस्टेट मसाजर शामिल हैं। शुरुआती लोगों के लिए, हम एंट्री लेवल मास्टर्बेटर आज़माने के लिए 3000 रुपये का बजट रखने की सलाह देते हैं।"
            },
            {
              q: "भारत में महिलाओं के लिए सबसे लोकप्रिय सेक्स टॉय कौन से हैं?",
              a: "किसी भी संदेह के बिना, महिलाओं के लिए सबसे लोकप्रिय सेक्स टॉय 'वाइब्रेटर' है। हमारे पास वाइब्रेटर का एक विशाल संग्रह है जो कंपन, चूसना, फ्लिक और टीज़ करते हैं; बड़े, छोटे और मिनी, बुलेट, अंडे, रैबिट वाइब्रेटर जैसे विभिन्न आकारों में। दूसरे सबसे लोकप्रिय प्रवेशक आनंद के लिए डिल्डो हैं। हमारे डेटा के अनुसार, टॉप 10 में फिफ्टी शेड्स जी-स्पॉट रैबिट वाइब्रेटर, सैटिस्फायर प्रो 2 प्रेशर वेव वाइब्रेटर, और लवेंस लश वाइब्रेटर शामिल हैं।"
            },
            {
              q: "भारत में जोड़ों के लिए सबसे लोकप्रिय सेक्स टॉय कौन से हैं?",
              a: "जोड़ों के लिए सेक्स टॉय सेक्स के दौरान आनंद बढ़ाने के लिए डिज़ाइन किए गए हैं। लोकप्रिय विकल्पों में सैटिस्फायर पार्टनर प्लस शामिल है जिसे संभोग के दौरान महिला द्वारा पहना जा सकता है, सार्वजनिक खेल के लिए रिमोट-कंट्रोल्ड पैंटी वाइब्रेटर, और कंपन लव रिंग। लंबी दूरी के रिश्तों के लिए, हम लवेंस और किरू ब्रांड की अनुशंसा करते हैं जो पार्टनरों को ऐप के माध्यम से एक-दूसरे के टॉय को नियंत्रित करने की अनुमति देते हैं।"
            }
          ]
        },
        {
          title: "गोपनीयता और सुरक्षा",
          icon: <Shield className="h-5 w-5" />,
          questions: [
            {
              q: "गोपनीयता और पैकेजिंग के बारे में क्या?",
              a: "हम आपके उपयोगकर्ता डेटा की 100% गोपनीयता और आपके ऑर्डर के डिस्क्रीट पैकेजिंग की गारंटी देते हैं। बाहर कुछ भी नहीं है जो अंदर क्या है इसका पता चले, यहां तक कि हमारे नाम का भी नहीं। हम अपने ऑर्डर को एक बहुत ही सादे व्हाइट बॉक्स में पैक करते हैं, इसे हमारी वेबसाइट या सामग्री का कोई उल्लेख नहीं करके लेबल करते हैं। आपका व्यवसाय आपका रहता है। कोई भी नहीं, न आपके पड़ोसी, आपकी मां, या आपका शोरशीट रूममेट को पता नहीं चलेगा कि अंदर क्या है।"
            },
            {
              q: "क्या भारत में सेक्स टॉय खरीदना कानूनी है?",
              a: "हाँ, जब तक आप इसे ऑनलाइन खरीद रहे हैं, भारत में सेक्स टॉय खरीदना पूरी तरह से कानूनी है। हम 2025 से उन्हें बेच रहे हैं। बेचे गए उत्पादों को मल्टी-फंक्शन डिवाइस, मसाजर और वेलनेस उत्पादों के रूप में वर्गीकृत किया गया है। उत्पादों को डिस्क्रीट रूप से भेजा जाता है, और पैकेजिंग में कोई नग्नता या अश्लीलता नहीं होती है। हालिया अदालती फैसलों के अनुसार, व्यक्तिगत उपयोग के लिए वयस्क टॉय पूरी तरह से कानूनी हैं।"
            }
          ]
        },
        {
          title: "शिपिंग और डिलीवरी",
          icon: <Globe className="h-5 w-5" />,
          questions: [
            {
              q: "समान दिन या 24-घंटे की डिलीवरी कैसे काम करती है?",
              a: "समान दिन की डिलीवरी विकल्प उसी दिन डिलीवरी प्रदान करता है जिस दिन आपने ऑर्डर किया, बशर्ते आपने दोपहर 4 बजे IST (सोम-शुक्र) तक पूर्ण भुगतान कर दिया हो। यह विकल्प केवल दिल्ली/एनसीआर क्षेत्र में दिया जाता है। 24-घंटे की डिलीवरी ऑर्डर के समय से 24 घंटे या उससे कम समय में डिलीवरी प्रदान करती है ज्यादातर मेट्रो शहरों में जैसे मुंबई, बेंगलुरु, दिल्ली/एनसीआर, चेन्नई, कोलकाता, हैदराबाद, पुणे और अन्य।"
            },
            {
              q: "शिपिंग शुल्क के बारे में क्या?",
              a: "1000 रुपये से अधिक के सभी ऑर्डर पर भारत भर में निःशुल्क शिपिंग। आमतौर पर, मेट्रो शहरों के लिए डिलीवरी में 2 से 3 व्यावसायिक दिन और गैर-मेट्रो और टियर 2 शहरों के लिए 2 से 6 व्यावसायिक दिन लगते हैं। एक्सप्रेस शिपिंग (2 से 4 व्यावसायिक दिन) मेट्रो शहरों के लिए उपलब्ध है और चेकआउट पर चुना जा सकता है।"
            },
            {
              q: "मैंने कैश ऑन डिलीवरी चुना है। क्या मैं अब ऑनलाइन भुगतान कर सकता हूं?",
              a: "हाँ, आप कर सकते हैं। लेकिन, यह आपके ऑर्डर की स्थिति पर निर्भर करता है। यदि आपका ऑर्डर अभी तक भेजा नहीं गया है, तो हम आपके ऑर्डर के भुगतान मोड को 'कैश ऑन डिलीवरी' से 'प्रीपेड' में बदल सकते हैं। आपको तुरंत हमारी ग्राहक सेवा टीम से संपर्क करना होगा। यदि आपका ऑर्डर पहले ही भेज दिया गया है, तो हम भुगतान मोड को नहीं बदल सकते।"
            }
          ]
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
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <div className="space-y-12">
          {t.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground">{section.title}</h3>
              </div>

              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {section.questions.map((faq, faqIndex) => (
                  <Card key={faqIndex} className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span>{faq.q}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {sectionIndex < t.sections.length - 1 && (
                <Separator className="my-12" />
              )}
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h4 className="font-semibold">100% Genuine</h4>
              <p className="text-sm text-muted-foreground">Authentic Products</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h4 className="font-semibold">100% Discreet</h4>
              <p className="text-sm text-muted-foreground">Privacy Guaranteed</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Package className="h-8 w-8 text-orange-600" />
              <h4 className="font-semibold">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground">2-6 Business Days</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="h-8 w-8 text-red-600" />
              <h4 className="font-semibold">Customer Care</h4>
              <p className="text-sm text-muted-foreground">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};