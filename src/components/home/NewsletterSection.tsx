
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const NewsletterSection = () => {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real application, you would send this to your backend
      toast.success("Cảm ơn bạn đã đăng ký!");
      setEmail("");
    } else {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
    }
  };

  return (
    <div className="bg-[#19C37D] py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Bắt đầu với AccZen.net ngay hôm nay</h2>
          <p className="mb-8 text-white/90">
            Đăng ký tài khoản để trải nghiệm mua sắm sản phẩm số dễ dàng và nhanh chóng
          </p>
          
          <div className="mb-8">
            <Button 
              className="whitespace-nowrap bg-white hover:bg-white/90 text-[#19C37D] font-medium px-8"
              asChild
            >
              <Link to="/register">Đăng ký ngay</Link>
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn"
              className="bg-white border-0 focus-visible:ring-[#15a76b] text-[#343541]"
              required
            />
            <Button 
              type="submit" 
              className="whitespace-nowrap bg-[#343541] hover:bg-[#202123] text-white"
            >
              Đăng ký nhận tin
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-white/75">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;
