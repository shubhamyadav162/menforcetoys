import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EnhancedCheckoutForm from "@/components/EnhancedCheckoutForm";

const Checkout = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  // Force scroll to top on mobile when entering checkout
  useState(() => {
    window.scrollTo(0, 0);
  });

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Alert className="mb-6 border-yellow-200 bg-yellow-50 max-w-md">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {language === "en"
                  ? "Please select a product first to proceed to checkout."
                  : "चेकआउट पर जारी रखने के लिए कृपया पहले एक उत्पाद चुनें।"
                }
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/shop')}>
              {language === "en" ? "Back to Shop" : "दुकान पर वापस जाएं"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header />
      <main className="flex-1 py-4 md:py-8">
        <EnhancedCheckoutForm
          product={product}
        // userId can be added here when user authentication is implemented
        />
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;