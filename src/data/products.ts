import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "test-product",
    name: {
      en: "Test Product - Payment Gateway Test",
      hi: "टेस्ट प्रोडक्ट - पेमेंट गेटवे टेस्ट"
    },
    description: {
      en: "🧪 Test Product - Perfect for testing payment gateway • 100% discreet",
      hi: "🧪 टेस्ट प्रोडक्ट - पेमेंट गेटवे टेस्ट के लिए उपयुक्त • 100% गोपनीय"
    },
    price: 1,
    image: "/products/test-product.webp",
    category: "test",
    specs: ["Payment Testing", "No GST", "Final Price", "Quick Delivery"],
    isTest: true
  },
  {
    id: "stretchable-toy",
    name: {
      en: "Premium Stretchable Pocket Pussy",
      hi: "प्रीमियम स्ट्रेचेबल पॉकेट पुसी"
    },
    description: {
      en: "✊ Stretchable Pocket Pussy - Easy to use • Simple to carry and clean",
      hi: "✊ स्ट्रेचेबल पॉकेट पुसी - आसान इस्तेमाल • कैरी और सफाई में सरल"
    },
    price: 499,
    image: "/products/stretchable-pocket-pussy.webp",
    category: "toys",
    specs: ["Stretchable Material", "Easy to Clean", "Portable", "Discreet", "No Hidden GST"]
  },
  {
    id: "realistic-toy",
    name: {
      en: "Ultra-Realistic Premium Pussy",
      hi: "अल्ट्रा-रियलिस्टिक प्रीमियम पुसी"
    },
    description: {
      en: "🍑 Realistic Pussy - Real feeling • Soft and skin-friendly",
      hi: "🍑 रियलिस्टिक पुसी - असली जैसा अहसास • सॉफ्ट और स्किन-फ्रेंडली"
    },
    price: 999,
    image: "/products/realistic-pocket-pussy.jpg",
    category: "toys",
    specs: ["Realistic Texture", "Skin-Friendly", "Soft Material", "Premium Quality", "No Hidden GST"]
  },
  {
    id: "black-case-toy",
    name: {
      en: "Deluxe Black Case Vibrator",
      hi: "डीलक्स ब्लैक केस वाइब्रेटर"
    },
    description: {
      en: "🖤 Big Pussy with Vibrator - Secret design • Realistic internal texture",
      hi: "🖤 बिग पुसी विथ वाइब्रेटर - गुप्त डिजाइन • रियलिस्टिक इंटरनल टेक्सचर"
    },
    price: 1499,
    image: "/products/vibrating-pocket-pussy.jpg",
    category: "toys",
    specs: ["Vibrating Function", "Discreet Case", "Realistic Texture", "Multiple Modes", "No Hidden GST"]
  },
  {
    id: "lubricant",
    name: {
      en: "Strawberry Flavored Premium Lubricant",
      hi: "स्ट्रॉबेरी फ्लेवर्ड प्रीमियम ल्यूब्रिकेंट"
    },
    description: {
      en: "💧 Lubricant - Smooth experience • Strawberry flavor",
      hi: "💧 ल्यूब्रिकेंट - स्मूद अनुभव • Strawberry फ्लेवर"
    },
    price: 199,
    image: "/products/strawberry-lubricant.webp",
    category: "accessories",
    specs: ["Strawberry Flavor", "Smooth", "Long-Lasting", "Body-Safe", "No Hidden GST"]
  }
];