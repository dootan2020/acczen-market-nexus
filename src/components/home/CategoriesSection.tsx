
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Users, Key } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio"; 

interface CategoryCardProps { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string;
}

const CategoryCard = ({ icon, title, description, link }: CategoryCardProps) => (
  <Card className="overflow-hidden border border-[#E5E5E5] hover:border-[#19C37D] transition-all hover:shadow-md group hover:scale-105 duration-300">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="w-full">
        <Link to={link} className="block w-full">
          <AspectRatio ratio={1/1} className="mb-4 w-16 h-16 mx-auto">
            <div className="w-full h-full rounded-full bg-[#F7F7F8] text-[#19C37D] group-hover:bg-[#19C37D] group-hover:text-white transition-colors flex items-center justify-center">
              {icon}
            </div>
          </AspectRatio>
          <h3 className="text-xl font-semibold mb-2 text-[#202123]">{title}</h3>
          <p className="text-[#8E8EA0] mb-4">{description}</p>
          <span className="text-[#19C37D] font-medium group-hover:underline">View More</span>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const CategoriesSection = () => {
  const categories = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Accounts",
      description: "Verified email accounts for MMO",
      link: "/products?category=email"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Social Accounts",
      description: "Multi-platform social media accounts",
      link: "/products?category=social"
    },
    {
      icon: <Key className="h-8 w-8" />,
      title: "Software Keys",
      description: "Genuine software activation keys",
      link: "/products?category=software"
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
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
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
