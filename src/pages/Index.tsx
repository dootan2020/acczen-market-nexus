
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Package, Calendar, Settings } from "lucide-react";
import ProductCard from "@/components/ProductCard";

// Sample product data (would come from API/database in production)
const featuredProducts = [
  {
    id: "1",
    name: "Gmail PVA Accounts (Phone Verified)",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 3.99,
    category: "Email Accounts",
    stock: 150,
    featured: true,
  },
  {
    id: "2",
    name: "Facebook Aged Accounts (2+ Years)",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 8.99,
    category: "Social Accounts",
    stock: 42,
    featured: true,
  },
  {
    id: "3",
    name: "Windows 11 Pro License Key",
    image: "https://images.unsplash.com/photo-1624571409108-e9c7398c3ce6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 14.99,
    category: "Software Keys",
    stock: 75,
    featured: true,
  },
  {
    id: "4",
    name: "Instagram Verified Accounts",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 24.99,
    category: "Social Accounts",
    stock: 5,
    featured: true,
  },
];

// Sample categories
const categories = [
  {
    id: "email",
    name: "Email Accounts",
    icon: <Package className="h-8 w-8 mb-2 text-primary" />,
    description: "Gmail, Yahoo, Outlook and more",
    count: 120,
  },
  {
    id: "social",
    name: "Social Accounts",
    icon: <ShoppingCart className="h-8 w-8 mb-2 text-primary" />,
    description: "Facebook, Instagram, Twitter and more",
    count: 85,
  },
  {
    id: "software",
    name: "Software Keys",
    icon: <Settings className="h-8 w-8 mb-2 text-primary" />,
    description: "Windows, Office, Antivirus and more",
    count: 45,
  },
  {
    id: "digital",
    name: "Digital Services",
    icon: <Calendar className="h-8 w-8 mb-2 text-primary" />,
    description: "SEO, Marketing, Design services",
    count: 30,
  },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-sm text-secondary">
                Trusted by 10,000+ customers
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Premium Digital Products with <span className="text-primary">Instant Delivery</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                AccZen.net is your trusted marketplace for digital accounts, software keys, and MMO products with automated delivery and 24/7 support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/products">
                  <Button size="lg" className="gap-2">
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" size="lg">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-3xl opacity-30"></div>
              <div className="relative bg-background rounded-lg border shadow-xl overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-muted">
                  {["Gmail Accounts", "Facebook Accounts", "Windows Keys", "Instagram Accounts"].map((item, i) => (
                    <div key={i} className="bg-background p-6 flex flex-col items-center justify-center text-center">
                      <div className="text-2xl font-bold mb-1">{i === 0 ? "$3.99" : i === 1 ? "$8.99" : i === 2 ? "$14.99" : "$24.99"}</div>
                      <div className="text-sm text-muted-foreground">{item}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-background">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">Secure Payment</div>
                    <div className="flex space-x-1">
                      <div className="w-6 h-6 rounded-full bg-primary/20"></div>
                      <div className="w-6 h-6 rounded-full bg-secondary/20"></div>
                      <div className="w-6 h-6 rounded-full bg-muted"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-muted-foreground/20 w-3/4"></div>
                    <div className="h-2 rounded-full bg-muted-foreground/20 w-1/2"></div>
                  </div>
                  <Button className="mt-4 w-full">Instant Delivery</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-16 border-y">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground mt-1">Automated system delivers products within seconds</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Secure Payments</h3>
              <p className="text-sm text-muted-foreground mt-1">PayPal integration with buyer protection</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">24/7 Support</h3>
              <p className="text-sm text-muted-foreground mt-1">Round the clock customer assistance</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">100% Guaranteed</h3>
              <p className="text-sm text-muted-foreground mt-1">Replacements for any defective products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Products</h2>
              <p className="text-muted-foreground">Our most popular digital products with instant delivery</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                price={product.price}
                category={product.category}
                stock={product.stock}
                featured={product.featured}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse By Category</h2>
            <p className="text-muted-foreground mt-2">Explore our wide range of digital products organized by category</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <div className="bg-background border rounded-lg p-6 hover:shadow-md transition-all hover:border-primary/30 text-center">
                  <div className="flex justify-center">{category.icon}</div>
                  <h3 className="text-lg font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <span className="text-xs bg-muted rounded-full px-2 py-1">
                    {category.count} products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Ready to Buy Digital Products?</h2>
              <p className="text-muted-foreground">
                Create an account now to start purchasing digital products with instant delivery. 
                Get access to exclusive deals and track your orders in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/auth/register">
                  <Button size="lg">Create an Account</Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg">Login</Button>
                </Link>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="rounded-lg bg-background border p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Customer Testimonial</h3>
                <blockquote className="text-muted-foreground italic mb-4">
                  "AccZen provided me with high-quality Gmail accounts for my business at a great price. 
                  The instant delivery and customer support were exceptional."
                </blockquote>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                  <div className="text-sm">
                    <div className="font-medium">John Smith</div>
                    <div className="text-muted-foreground">Digital Marketer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
