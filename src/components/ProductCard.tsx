import { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentDebugger from "@/utils/paymentDebugger";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    en: { buyNow: "Buy Now" },
    hi: { buyNow: "अभी खरीदें" }
  };

  const t = content[language];

  const handleBuyNow = () => {
    PaymentDebugger.logNavigationFlow('ProductCard', '/checkout', { product });
    navigate('/checkout', { state: { product } });
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-elegant transition-all duration-300 border-border cursor-pointer"
      onClick={handleBuyNow}
    >
      <div className="aspect-square overflow-hidden bg-secondary/10">
        <img
          src={product.image}
          alt={product.name[language]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
          {product.name[language]}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description[language]}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            {t.buyNow}
          </Button>
        </div>
      </div>
    </Card>
  );
};
