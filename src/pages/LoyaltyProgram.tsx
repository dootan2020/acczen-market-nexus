
import React from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Star, Gift, BadgeCheck, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/contexts/AuthContext';

const LoyaltyProgram: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-2">
            <Award className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Chương trình thành viên thân thiết</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tích điểm với mỗi giao dịch và nhận nhiều đặc quyền hấp dẫn cùng ưu đãi giảm giá độc quyền
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-bronze">
            <CardHeader className="text-center bg-[#CD7F32]/10">
              <CardTitle className="text-[#CD7F32]">Bronze</CardTitle>
              <p className="text-2xl font-bold">0 điểm</p>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center font-bold text-lg mb-4">0% giảm giá</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#CD7F32] flex-shrink-0 mt-0.5" />
                  <span>Hỗ trợ cơ bản</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#CD7F32] flex-shrink-0 mt-0.5" />
                  <span>Giao hàng tiêu chuẩn</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center bg-[#C0C0C0]/10">
              <CardTitle className="text-[#C0C0C0]">Silver</CardTitle>
              <p className="text-2xl font-bold">100 điểm</p>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center font-bold text-lg mb-4">2% giảm giá</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                  <span>Hỗ trợ ưu tiên</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                  <span>Miễn phí vận chuyển</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#C0C0C0] flex-shrink-0 mt-0.5" />
                  <span>Tiếp cận sớm các chương trình giảm giá</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center bg-[#FFD700]/10">
              <CardTitle className="text-[#FFD700]">Gold</CardTitle>
              <p className="text-2xl font-bold">500 điểm</p>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center font-bold text-lg mb-4">5% giảm giá</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span>Hỗ trợ 24/7</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span>Miễn phí vận chuyển</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span>Tiếp cận sớm các chương trình giảm giá</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span>Chương trình khuyến mãi độc quyền</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center bg-[#E5E4E2]/10">
              <CardTitle className="text-[#E5E4E2]">Platinum</CardTitle>
              <p className="text-2xl font-bold">1000 điểm</p>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center font-bold text-lg mb-4">10% giảm giá</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#E5E4E2] flex-shrink-0 mt-0.5" />
                  <span>Hỗ trợ 24/7 chuyên biệt</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#E5E4E2] flex-shrink-0 mt-0.5" />
                  <span>Miễn phí vận chuyển express</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#E5E4E2] flex-shrink-0 mt-0.5" />
                  <span>Tiếp cận sớm các chương trình giảm giá</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#E5E4E2] flex-shrink-0 mt-0.5" />
                  <span>Chương trình khuyến mãi độc quyền</span>
                </li>
                <li className="flex items-start">
                  <BadgeCheck className="h-5 w-5 mr-2 text-[#E5E4E2] flex-shrink-0 mt-0.5" />
                  <span>Quà tặng đặc biệt</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center mt-8">
          {user ? (
            <Button asChild size="lg">
              <Link to="/dashboard/loyalty">
                Xem tình trạng thành viên của bạn
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/login?returnTo=/dashboard/loyalty">
                Đăng nhập để tham gia
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="text-center">
            <div className="bg-primary/10 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Tích điểm dễ dàng</h3>
            <p className="text-muted-foreground">Nhận 1 điểm cho mỗi $1 chi tiêu tại AccZen.net</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Ưu đãi độc quyền</h3>
            <p className="text-muted-foreground">Giảm giá và đặc quyền tăng dần theo cấp độ thành viên</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Không giới hạn thời gian</h3>
            <p className="text-muted-foreground">Điểm thành viên không bị hết hạn, bạn có thể tích lũy dần dần</p>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Câu hỏi thường gặp</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Làm sao để tích điểm?</AccordionTrigger>
              <AccordionContent>
                Khi bạn mua hàng trên AccZen.net, bạn sẽ tích lũy được 1 điểm thành viên cho mỗi $1 chi tiêu. Điểm sẽ được cộng vào tài khoản ngay khi đơn hàng hoàn tất.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Làm sao để nâng cấp lên cấp độ cao hơn?</AccordionTrigger>
              <AccordionContent>
                Cấp độ thành viên của bạn được xác định dựa trên tổng số điểm đã tích lũy. Khi đạt đến ngưỡng điểm cần thiết, bạn sẽ tự động được nâng cấp lên cấp độ cao hơn và được thông báo.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Điểm thành viên có hết hạn không?</AccordionTrigger>
              <AccordionContent>
                Không, điểm thành viên của bạn không có thời hạn sử dụng. Bạn có thể tích lũy dần dần để đạt cấp độ mong muốn.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Làm sao để sử dụng giảm giá từ cấp độ thành viên?</AccordionTrigger>
              <AccordionContent>
                Giảm giá từ cấp độ thành viên sẽ được áp dụng tự động mỗi khi bạn thanh toán. Mức giảm giá phụ thuộc vào cấp độ thành viên hiện tại của bạn và sẽ được hiển thị trong trang thanh toán.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Tôi có thể theo dõi điểm và cấp độ thành viên ở đâu?</AccordionTrigger>
              <AccordionContent>
                Bạn có thể xem thông tin về điểm và cấp độ thành viên trong phần "Thành viên" trên trang Dashboard hoặc tài khoản cá nhân của bạn.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="bg-primary/5 rounded-xl p-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Bạn đã sẵn sàng nhận ưu đãi?</h3>
              <p className="text-muted-foreground">Đăng ký và bắt đầu tích điểm ngay hôm nay</p>
            </div>
            {user ? (
              <Button asChild size="lg">
                <Link to="/products">
                  Mua sắm ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/register">
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default LoyaltyProgram;
