
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Users, Key } from "lucide-react";
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
  <Card className="overflow-hidden border border-[#E5E5E5] hover:border-[#19C37D] transition-all hover:shadow-md group hover-lift">
    <Link to={link}>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-full bg-[#F7F7F8] text-[#19C37D] group-hover:bg-[#19C37D] group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#202123]">{title}</h3>
        <p className="text-[#8E8EA0] mb-4">{description}</p>
        <span className="text-[#19C37D] font-medium group-hover:underline">Xem thêm</span>
      </CardContent>
    </Link>
  </Card>
);

const CategoriesSection = () => {
  const categories = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Accounts",
      description: "Tài khoản email xác minh cho MMO",
      link: "/products?category=email"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Social Accounts",
      description: "Tài khoản mạng xã hội đa nền tảng",
      link: "/products?category=social"
    },
    {
      icon: <Key className="h-8 w-8" />,
      title: "Software Keys",
      description: "Key kích hoạt phần mềm chính hãng",
      link: "/products?category=software"
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#202123]">Danh mục sản phẩm</h2>
          <p className="text-[#8E8EA0] max-w-2xl mx-auto">
            Khám phá các sản phẩm số đa dạng của chúng tôi được phân loại theo danh mục
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
