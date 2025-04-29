
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-muted/30 border-t border-border/40 py-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categories/email-accounts" className="text-sm text-muted-foreground hover:text-foreground">
                  Email Accounts
                </Link>
              </li>
              <li>
                <Link to="/categories/social-accounts" className="text-sm text-muted-foreground hover:text-foreground">
                  Social Accounts
                </Link>
              </li>
              <li>
                <Link to="/categories/software-keys" className="text-sm text-muted-foreground hover:text-foreground">
                  Software Keys
                </Link>
              </li>
              <li>
                <Link to="/categories/digital-services" className="text-sm text-muted-foreground hover:text-foreground">
                  Digital Services
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AccZen.net. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Twitter
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Facebook
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
