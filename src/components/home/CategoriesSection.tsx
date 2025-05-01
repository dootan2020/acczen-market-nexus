
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Users, Key } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string;
  colorClass: string;
  bgClass: string;
}

const CategoryCard = ({ icon, title, description, link, colorClass, bgClass }: CategoryCardProps) => (
  <Card className="overflow-hidden border border-[#E5E5E5] hover:border-[#19C37D] transition-all hover:shadow-lg group hover:scale-105 duration-300 cursor-pointer active:scale-95">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="w-full">
        <Link to={link} className="block w-full">
          <div className="mb-4 flex justify-center">
            <div className={`w-24 h-24 rounded-full ${bgClass} ${colorClass} flex items-center justify-center transition-colors group-hover:scale-110 duration-300`}>
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[#202123] group-hover:text-[#19C37D] transition-colors">{title}</h3>
          <p className="text-[#8E8EA0] mb-4 line-clamp-2">{description}</p>
          <span className="text-[#19C37D] font-medium group-hover:underline transition-all">View More</span>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const CategoriesSection = () => {
  const categories = [
    {
      icon: <Mail className="h-12 w-12" />,
      title: "Email Accounts",
      description: "Verified email accounts for MMO and marketing",
      link: "/products?category=email",
      colorClass: "text-[#2ECC71]",
      bgClass: "bg-[#2ECC71]/10"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Social Accounts",
      description: "Premium social media accounts for business",
      link: "/products?category=social",
      colorClass: "text-[#3498DB]",
      bgClass: "bg-[#3498DB]/10"
    },
    {
      icon: <Key className="h-12 w-12" />,
      title: "Software Keys",
      description: "Genuine software activation keys at best prices",
      link: "/products?category=software",
      colorClass: "text-[#9B59B6]",
      bgClass: "bg-[#9B59B6]/10"
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-[#202123]">Product Categories</h2>
          <p className="text-[#8E8EA0] max-w-2xl mx-auto">
            Explore our digital products categorized for your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <CategoryCard 
                icon={category.icon}
                title={category.title}
                description={category.description}
                link={category.link}
                colorClass={category.colorClass}
                bgClass={category.bgClass}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
