
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Quy trình mua hàng như thế nào?",
      answer: "Quy trình mua hàng tại AccZen.net rất đơn giản: Chọn sản phẩm, thêm vào giỏ hàng, thanh toán bằng số dư tài khoản hoặc PayPal, và nhận sản phẩm ngay lập tức qua email hoặc dashboard cá nhân của bạn."
    },
    {
      question: "Tôi nhận sản phẩm bằng cách nào?",
      answer: "Sau khi hoàn tất thanh toán, sản phẩm số của bạn sẽ được gửi ngay lập tức qua email đăng ký và hiển thị trong mục 'Sản phẩm đã mua' trên trang cá nhân. Bạn có thể truy cập và sử dụng sản phẩm ngay lập tức."
    },
    {
      question: "Các phương thức thanh toán được hỗ trợ?",
      answer: "AccZen.net hỗ trợ thanh toán qua số dư tài khoản (nạp trước) và thanh toán trực tiếp qua PayPal. Chúng tôi đảm bảo mọi giao dịch đều an toàn và bảo mật."
    },
    {
      question: "Chính sách hoàn tiền như thế nào?",
      answer: "Chúng tôi cung cấp hoàn tiền nếu sản phẩm không hoạt động như mô tả. Tuy nhiên, do tính chất của sản phẩm số, chúng tôi không hoàn tiền nếu bạn đã truy cập và sử dụng thông tin tài khoản hoặc key phần mềm."
    },
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-[#202123]">Câu hỏi thường gặp</h2>
        <p className="text-center text-[#8E8EA0] mb-12 max-w-2xl mx-auto">
          Tìm câu trả lời cho các câu hỏi phổ biến về sản phẩm số, quy trình mua hàng và dịch vụ hỗ trợ của chúng tôi
        </p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#E5E5E5]">
                <AccordionTrigger className="text-left text-[#343541] hover:text-[#19C37D]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#8E8EA0]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
