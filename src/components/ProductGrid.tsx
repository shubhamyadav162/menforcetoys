import { products } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";

export const ProductGrid = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "🔥 Our Bestseller Products",
      subtitle: "High-quality adult wellness products with discreet delivery"
    },
    hi: {
      title: "🔥 हमारे बेस्टसेलर प्रोडक्ट्स",
      subtitle: "डिस्क्रीट डिलीवरी के साथ उच्च-गुणवत्ता वाले वयस्क कल्याण उत्पाद"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
