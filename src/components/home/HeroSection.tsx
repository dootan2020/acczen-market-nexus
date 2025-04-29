
import { ShoppingCart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-[#F7F7F8] pt-10 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-[#202123]">
              Premium Digital Products for Everyone
            </h1>
            <p className="text-lg md:text-xl mb-8 text-[#8E8EA0] leading-relaxed">
              AccZen.net offers high-quality digital products including email accounts, 
              social media accounts, and software keys at competitive prices with 
              instant delivery and 24/7 customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="text-base font-medium bg-[#19C37D] hover:bg-[#15a76b] text-white shadow-sm"
              >
                <Link to="/products">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-base font-medium border-[#E5E5E5] text-[#202123] hover:bg-[#F7F7F8]"
              >
                <Link to="/products">
                  <Search className="mr-2 h-5 w-5" />
                  Search Products
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center animate-fade-in">
            <img 
              src="/lovable-uploads/bb7a0cf2-88c6-403e-94bd-a94f9f1d4be8.png" 
              alt="Digital Products Illustration" 
              className="rounded-lg shadow-lg max-w-full h-auto hover-lift"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
