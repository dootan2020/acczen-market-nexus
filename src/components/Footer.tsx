
import { useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Mock subscription - would connect to API in real implementation
    toast({
      title: "Newsletter subscription successful",
      description: "Thank you for subscribing to our newsletter!",
      variant: "success",
    });
    
    setEmail("");
  };
  
  return (
    <footer className="w-full bg-muted/10 border-t border-border/20 py-12 transition-colors">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-primary">AccZen</span>
              <span>.net</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for digital products in the MMO niche.
              Secure, fast, automated delivery.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-foreground">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/categories/email-accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Email Accounts
                </Link>
              </li>
              <li>
                <Link to="/categories/social-accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Social Accounts
                </Link>
              </li>
              <li>
                <Link to="/categories/software-keys" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Software Keys
                </Link>
              </li>
              <li>
                <Link to="/categories/digital-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Digital Services
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-foreground">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-foreground">Subscribe to Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with our latest offers and products.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email for newsletter"
                  required
                />
                <Button type="submit" className="rounded-l-none">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll never share your email with anyone else.
              </p>
            </form>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AccZen.net. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/refund-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
