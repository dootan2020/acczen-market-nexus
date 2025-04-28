
import React from "react";
import { Star } from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const Testimonial = ({ quote, author, role, rating }: TestimonialProps) => {
  return (
    <Card className="border-border/40 h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? "text-primary fill-primary" : "text-muted-foreground"}`}
            />
          ))}
        </div>
        <blockquote className="text-lg mb-4 flex-grow">"{quote}"</blockquote>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
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
      rating: 5
    },
    {
      quote: "I've been using their social media accounts for my business and the results have been amazing. Highly recommended!",
      author: "Michael Chen",
      role: "E-commerce Entrepreneur",
      rating: 5
    },
    {
      quote: "The software keys I purchased were delivered instantly and worked perfectly. Will definitely be a returning customer.",
      author: "David Williams",
      role: "IT Specialist",
      rating: 4
    },
    {
      quote: "Fantastic service and great prices. Their email accounts have been essential for my freelance work.",
      author: "Emma Thompson",
      role: "Freelance Designer",
      rating: 5
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by thousands of customers worldwide
          </p>
        </div>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-2">
                <Testimonial
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  rating={testimonial.rating}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-6">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default TestimonialsSection;
