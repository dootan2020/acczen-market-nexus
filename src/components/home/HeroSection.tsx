
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto py-16 md:py-24 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Premium Digital Products for Everyone
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              AccZen.net offers high-quality digital products including email accounts, 
              social media accounts, and software keys at competitive prices with 
              instant delivery and 24/7 customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="text-base font-medium bg-primary hover:bg-primary/90 text-white"
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
                className="text-base font-medium bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <img 
              src="/lovable-uploads/bb7a0cf2-88c6-403e-94bd-a94f9f1d4be8.png" 
              alt="Digital Products Illustration" 
              className="rounded-lg shadow-xl max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
