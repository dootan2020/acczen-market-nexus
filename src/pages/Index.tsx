
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FAQSection from "@/components/home/FAQSection";

const Index = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <FeaturedProducts />
      <FAQSection />
    </div>
  );
};

export default Index;
