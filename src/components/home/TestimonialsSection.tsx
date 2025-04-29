
import React from "react";
import { Star, User, Check } from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
  avatar?: string;
  verified?: boolean;
  purchasedProduct?: string;
}

const Testimonial = ({ 
  quote, 
  author, 
  role, 
  rating, 
  avatar, 
  verified = false,
  purchasedProduct 
}: TestimonialProps) => {
  return (
    <Card className="border-[#E5E5E5] h-full shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < rating ? "text-[#19C37D] fill-[#19C37D]" : "text-[#E5E5E5]"}`}
              />
            ))}
          </div>
          
          {verified && (
            <Badge variant="outline" className="ml-auto text-xs py-0 bg-[#F7F7F8] text-[#19C37D] border-[#E5E5E5]">
              <Check className="mr-1 h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        
        {purchasedProduct && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs bg-[#F7F7F8] text-[#8E8EA0] border-[#E5E5E5]">
              Purchased: {purchasedProduct}
            </Badge>
          </div>
        )}
        
        <blockquote className="text-lg mb-4 flex-grow text-[#343541]">"{quote}"</blockquote>
        
        <div className="flex items-center gap-3">
          <Avatar>
            {avatar ? (
              <AvatarImage src={avatar} alt={author} />
            ) : (
              <AvatarFallback className="bg-[#F7F7F8]">
                <User className="h-4 w-4 text-[#8E8EA0]" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-semibold text-[#202123]">{author}</p>
            <p className="text-sm text-[#8E8EA0]">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Digital Deals Hub has been a game-changer for our business. Their email accounts are reliable and their customer service is top-notch.",
      author: "Sarah Johnson",
      role: "Marketing Director",
      rating: 5,
      verified: true,
      purchasedProduct: "Gmail Accounts Bundle"
    },
    {
      quote: "I've been using their social media accounts for my business and the results have been amazing. Highly recommended!",
      author: "Michael Chen",
      role: "E-commerce Entrepreneur",
      rating: 5,
      verified: true,
      purchasedProduct: "Instagram Verified Accounts"
    },
    {
      quote: "The software keys I purchased were delivered instantly and worked perfectly. Will definitely be a returning customer.",
      author: "David Williams",
      role: "IT Specialist",
      rating: 4,
      verified: true,
      purchasedProduct: "Windows 10 Pro Keys"
    },
    {
      quote: "Fantastic service and great prices. Their email accounts have been essential for my freelance work.",
      author: "Emma Thompson",
      role: "Freelance Designer",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
      purchasedProduct: "Gmail+Outlook Bundle"
    },
    {
      quote: "Their PayPal accounts saved me so much time and hassle. The account was ready to use immediately after purchase.",
      author: "Robert Garcia",
      role: "Online Seller",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: true,
      purchasedProduct: "PayPal Aged Accounts"
    },
    {
      quote: "I was skeptical at first, but the quality of their products exceeded my expectations. Excellent value for money.",
      author: "Michelle Kim",
      role: "Digital Marketer",
      rating: 4,
      verified: true,
      purchasedProduct: "Twitter Accounts Pack"
    }
  ];

  return (
    <div className="py-20 bg-[#F7F7F8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#202123]">What Our Customers Say</h2>
          <p className="text-[#8E8EA0] max-w-2xl mx-auto">
            Trusted by thousands of customers worldwide
          </p>
        </div>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-2">
                <div className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Testimonial
                    quote={testimonial.quote}
                    author={testimonial.author}
                    role={testimonial.role}
                    rating={testimonial.rating}
                    avatar={testimonial.avatar}
                    verified={testimonial.verified}
                    purchasedProduct={testimonial.purchasedProduct}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-6">
            <CarouselPrevious className="bg-white border-[#E5E5E5] text-[#343541] hover:bg-[#F7F7F8] hover:text-[#19C37D]" />
            <CarouselNext className="bg-white border-[#E5E5E5] text-[#343541] hover:bg-[#F7F7F8] hover:text-[#19C37D]" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default TestimonialsSection;
