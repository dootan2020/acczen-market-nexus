
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
              Sản phẩm số cho MMO của bạn
            </h1>
            <p className="text-lg md:text-xl mb-8 text-[#8E8EA0] leading-relaxed">
              AccZen.net cung cấp tài khoản email, mạng xã hội và key phần mềm với giao 
              dịch tự động, an toàn và nhanh chóng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="text-base font-medium bg-[#19C37D] hover:bg-[#15a76b] text-white shadow-sm"
              >
                <Link to="/products">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Xem sản phẩm
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-base font-medium border-[#E5E5E5] text-[#202123] hover:bg-[#F7F7F8]"
              >
                <Link to="/register">
                  <Search className="mr-2 h-5 w-5" />
                  Đăng ký
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center animate-fade-in">
            <img 
              src="/lovable-uploads/49957701-a503-4364-874c-3e14ec190eed.png" 
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
