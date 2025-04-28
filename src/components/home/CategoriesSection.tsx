
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Users, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CategoryCard = ({ 
  icon, 
  title, 
  description, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string;
}) => (
  <Card className="overflow-hidden border border-border/60 hover:border-primary/30 transition-all hover:shadow-md group">
    <Link to={link}>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Link>
  </Card>
);

const CategoriesSection = () => {
  const categories = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Accounts",
      description: "Professional email accounts for business and personal use",
      link: "/products?category=email"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Social Accounts",
      description: "Verified social media accounts for your business needs",
      link: "/products?category=social"
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Software & Keys",
      description: "Premium software licenses at competitive prices",
      link: "/products?category=software"
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse Our Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our wide range of digital products organized by category
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              icon={category.icon}
              title={category.title}
              description={category.description}
              link={category.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
