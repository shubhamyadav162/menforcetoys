import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { Testimonials } from "@/components/Testimonials";
import { MediaMentions } from "@/components/MediaMentions";
import { FAQ } from "@/components/FAQ";
import { ComprehensiveFAQ } from "@/components/ComprehensiveFAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductGrid />
        <Testimonials />
        <MediaMentions />
        <FAQ />
        <ComprehensiveFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
