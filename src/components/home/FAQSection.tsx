
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "What kinds of digital products do you offer?",
      answer: "We offer a wide range of digital products including email accounts, social media accounts, software keys, premium subscriptions, and more. All our products are categorized for easy browsing."
    },
    {
      question: "How quickly will I receive my purchase?",
      answer: "Our delivery is instant for most products. After a successful payment, you'll receive your digital product details immediately on your dashboard and via email."
    },
    {
      question: "Are your products guaranteed to work?",
      answer: "Yes, all products come with a 100% satisfaction guarantee. If there's any issue with your purchase, our support team will help resolve it or provide a replacement within 24 hours."
    },
    {
      question: "How do I pay for products on AccZen.net?",
      answer: "You can add funds to your AccZen wallet using PayPal and then use your balance to make purchases. This allows for instant transactions without entering payment details each time."
    },
    {
      question: "What should I do if I encounter an issue with my purchase?",
      answer: "Contact our 24/7 support team immediately through the help section in your dashboard. We typically respond within an hour and work to resolve any issues as quickly as possible."
    },
    {
      question: "Do you offer refunds for digital products?",
      answer: "Yes, we offer refunds if the product doesn't work as described. However, due to the digital nature of our products, refunds are not provided if you've already accessed the account details or software keys."
    },
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-[#202123]">Frequently Asked Questions</h2>
        <p className="text-center text-[#8E8EA0] mb-12 max-w-2xl mx-auto">
          Find answers to common questions about our digital products, purchase process, and support services
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
