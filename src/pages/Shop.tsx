import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { useLanguage } from "@/contexts/LanguageContext";

const Shop = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Shop All Products",
      subtitle: "Browse our complete collection of intimate wellness products"
    },
    hi: {
      title: "सभी उत्पाद खरीदें",
      subtitle: "आत्मिक आनंद उत्पादों का हमारा पूरा संग्रह देखें"
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
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
