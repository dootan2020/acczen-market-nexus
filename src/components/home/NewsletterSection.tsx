
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real application, you would send this to your backend
      toast.success("Thanks for subscribing!");
      setEmail("");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  return (
    <div className="bg-[#19C37D] py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-8 text-white/90">
            Subscribe to our newsletter to receive updates on new products, special offers, and exclusive discounts.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-white border-0 focus-visible:ring-[#15a76b] text-[#343541]"
              required
            />
            <Button 
              type="submit" 
              className="whitespace-nowrap bg-[#343541] hover:bg-[#202123] text-white"
            >
              Subscribe
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-white/75">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;
