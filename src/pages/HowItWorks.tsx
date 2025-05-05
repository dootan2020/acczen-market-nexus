
import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { UserPlus, Wallet, ShoppingCart, Key, Check, Video, Circle, ArrowRight, CircleCheck, CircleArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const isDarkMode = theme === 'dark';
  
  const steps = [
    {
      id: 1,
      title: "Create an Account",
      description: "Sign up for a free AccZen.net account to access our digital products marketplace. The process takes less than a minute.",
      icon: <UserPlus className="w-10 h-10 text-[#19C37D]" />,
      cta: user ? "View Account" : "Sign Up Now",
      ctaLink: user ? "/dashboard" : "/register",
      image: "/lovable-uploads/bb7a0cf2-88c6-403e-94bd-a94f9f1d4be8.png"
    },
    {
      id: 2,
      title: "Add Funds to Your Account",
      description: "Deposit funds using PayPal, cryptocurrency, or other supported payment methods. All transactions are secure and protected.",
      icon: <Wallet className="w-10 h-10 text-[#19C37D]" />,
      cta: "View Payment Options",
      ctaLink: user ? "/deposit" : "/login",
      image: "/lovable-uploads/49957701-a503-4364-874c-3e14ec190eed.png"
    },
    {
      id: 3,
      title: "Browse & Select Products",
      description: "Explore our catalog of digital products including email accounts, social media accounts, and software keys. Filter by category to find what you need.",
      icon: <ShoppingCart className="w-10 h-10 text-[#19C37D]" />,
      cta: "Browse Products",
      ctaLink: "/products",
      image: "/lovable-uploads/bb7a0cf2-88c6-403e-94bd-a94f9f1d4be8.png"
    },
    {
      id: 4,
      title: "Purchase Products",
      description: "Buy products with your account balance. Our one-click purchase process makes it simple and fast to complete your order.",
      icon: <Key className="w-10 h-10 text-[#19C37D]" />,
      cta: "View Categories",
      ctaLink: "/categories",
      image: "/lovable-uploads/49957701-a503-4364-874c-3e14ec190eed.png"
    },
    {
      id: 5,
      title: "Instant Delivery",
      description: "Receive your digital products immediately after purchase. Access keys, login information, and digital content directly in your dashboard.",
      icon: <Check className="w-10 h-10 text-[#19C37D]" />,
      cta: "View Dashboard",
      ctaLink: user ? "/dashboard" : "/login",
      image: "/lovable-uploads/bb7a0cf2-88c6-403e-94bd-a94f9f1d4be8.png"
    },
  ];
  
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Register' button in the top navigation bar. Fill out the registration form with your email and password, then verify your email address to activate your account."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including PayPal, major credit cards, and cryptocurrencies like Bitcoin and USDT. All payment processing is secure and encrypted."
    },
    {
      question: "How long does delivery take?",
      answer: "Our delivery is instant! As soon as your payment is confirmed, your digital products will be available in your dashboard. You'll also receive an email confirmation with access details."
    },
    {
      question: "Are the products guaranteed to work?",
      answer: "Yes, all our products are guaranteed to work as described. If you encounter any issues, our customer support team is available to assist you, and we offer replacements for defective products."
    },
    {
      question: "How can I contact support?",
      answer: "You can contact our support team through the Help Center, by clicking on the 'Help' link in the footer or by emailing support@acczen.net. We aim to respond to all inquiries within 24 hours."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer refunds for products that don't work as described. However, due to the digital nature of our products, we cannot provide refunds if you've already accessed or used the product information."
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F7F7F8] to-background pt-16 pb-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#202123]">
              How AccZen.net Works
            </h1>
            <p className="text-lg md:text-xl mb-8 text-[#8E8EA0]">
              Our platform makes it easy to purchase digital products for your Make Money Online (MMO) projects. Follow these simple steps to get started.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="px-6">
                <Link to={user ? "/products" : "/register"}>
                  {user ? "Browse Products" : "Get Started"}
                </Link>
              </Button>
              <Button variant="outline" asChild className="px-6">
                <Link to="/help">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Process Steps Section */}
      <Container className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 relative">
            {/* Vertical line connector */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E5E5E5] hidden md:block" style={{ left: '39px' }}></div>

            {steps.map((step, index) => (
              <div key={step.id} className="grid md:grid-cols-[80px_1fr] gap-6 relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Step number and icon */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="w-20 h-20 rounded-full bg-[#F7F7F8] flex items-center justify-center relative z-10 border border-[#E5E5E5]">
                    {step.icon}
                  </div>
                  <div className="text-2xl font-bold mt-2 text-[#202123] md:hidden">
                    Step {step.id}
                  </div>
                </div>

                {/* Step content */}
                <Card className="overflow-hidden border border-[#E5E5E5] hover:border-[#19C37D]/30 transition-all duration-300 hover:shadow-md">
                  <div className="md:flex">
                    <div className="md:flex-1 p-6">
                      <h3 className="text-xl font-bold mb-2 text-[#202123]">
                        <span className="hidden md:inline-block mr-2 text-[#19C37D]">Step {step.id}:</span> 
                        {step.title}
                      </h3>
                      <p className="text-[#8E8EA0] mb-6">{step.description}</p>
                      <Button asChild variant="outline" className="mt-2">
                        <Link to={step.ctaLink}>
                          {step.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-100 overflow-hidden">
                      <img 
                        src={step.image} 
                        alt={`Step ${step.id}: ${step.title}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Video Tutorial Section */}
      <div className="bg-[#F7F7F8] py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-4 text-[#202123]">
              Video Tutorial
            </h2>
            <p className="text-[#8E8EA0]">
              Watch our quick video guide to learn how to use AccZen.net efficiently.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto bg-black aspect-video rounded-lg overflow-hidden shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <Video className="w-16 h-16 mx-auto mb-4 text-[#19C37D]" />
                <p className="text-xl">Video Tutorial Coming Soon</p>
                <p className="text-sm mt-2 text-gray-400">We're currently working on a comprehensive video guide</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* FAQ Section */}
      <Container className="py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4 text-[#202123]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#8E8EA0]">
            Find answers to common questions about using AccZen.net and purchasing digital products.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-[#202123] hover:text-[#19C37D]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#8E8EA0]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-[#19C37D]/10 py-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-[#202123]">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 text-[#8E8EA0]">
              Join thousands of satisfied customers who trust AccZen.net for their digital product needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to={user ? "/products" : "/register"}>
                  {user ? "Browse Products" : "Create Account"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="px-8">
                <Link to="/categories">
                  Explore Categories
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default HowItWorks;
