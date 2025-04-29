
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextContent from "@/components/RichTextContent";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Code, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductDescriptionProps {
  description: string;
  specifications?: string | null;
  usage?: string | null;
}

const ProductDescription = ({
  description,
  specifications,
  usage,
}: ProductDescriptionProps) => {
  const [activeTab, setActiveTab] = useState("description");
  
  // Mock review data - in a real app this would come from an API
  const reviews = {
    average: 4.5,
    count: 23,
    distribution: [
      { stars: 5, count: 15 },
      { stars: 4, count: 5 },
      { stars: 3, count: 2 },
      { stars: 2, count: 1 },
      { stars: 1, count: 0 },
    ]
  };
  
  if (!description && !specifications && !usage) {
    return null;
  }

  const maxReviewCount = Math.max(...reviews.distribution.map(item => item.count));
  
  return (
    <div className="w-full">
      <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-[#F9FAFB] rounded-t-lg">
          <TabsList className="h-auto p-0 bg-transparent w-full flex justify-start overflow-x-auto">
            <TabsTrigger 
              value="description" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2ECC71] data-[state=active]:text-[#2ECC71] data-[state=active]:bg-transparent py-4 px-6 flex items-center gap-2 font-medium transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-poppins">Mô tả sản phẩm</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2ECC71] data-[state=active]:text-[#2ECC71] data-[state=active]:bg-transparent py-4 px-6 flex items-center gap-2 font-medium transition-all duration-300"
            >
              <Star className="w-4 h-4" />
              <span className="font-poppins">Đánh giá sản phẩm</span>
            </TabsTrigger>
            
            {specifications && (
              <TabsTrigger 
                value="specifications" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2ECC71] data-[state=active]:text-[#2ECC71] data-[state=active]:bg-transparent py-4 px-6 flex items-center gap-2 font-medium transition-all duration-300"
              >
                <Code className="w-4 h-4" />
                <span className="font-poppins">Thông số kỹ thuật</span>
              </TabsTrigger>
            )}
            
            {usage && (
              <TabsTrigger 
                value="usage" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2ECC71] data-[state=active]:text-[#2ECC71] data-[state=active]:bg-transparent py-4 px-6 flex items-center gap-2 font-medium transition-all duration-300"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-poppins">Hướng dẫn sử dụng</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <CardContent className="pt-6 pb-8 px-6">
          <TabsContent value="description" className="mt-0 animate-fade-in">
            <div className="max-w-none">
              <RichTextContent content={description} />
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-0 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center p-6 bg-[#F9FAFB] rounded-lg">
                  <h3 className="text-lg font-semibold mb-1 font-poppins">Đánh giá trung bình</h3>
                  <div className="text-4xl font-bold text-[#2ECC71] mb-2 font-poppins">{reviews.average}</div>
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= reviews.average 
                            ? "fill-yellow-400 text-yellow-400" 
                            : star <= Math.ceil(reviews.average) 
                              ? "fill-yellow-400/50 text-yellow-400/50" 
                              : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground font-inter">
                    {reviews.count} đánh giá
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-lg font-semibold mb-4 font-poppins">Phân phối đánh giá</h3>
                
                <div className="space-y-3">
                  {reviews.distribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <div className="w-12 text-sm font-medium font-inter">{item.stars} sao</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#2ECC71] rounded-full" 
                          style={{ width: `${(item.count / maxReviewCount) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-sm text-right font-inter">{item.count}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button className="bg-[#3498DB] hover:bg-[#2980B9] transition-colors">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Viết đánh giá
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {specifications && (
            <TabsContent value="specifications" className="mt-0 animate-fade-in">
              <RichTextContent content={specifications} />
            </TabsContent>
          )}
          
          {usage && (
            <TabsContent value="usage" className="mt-0 animate-fade-in">
              <RichTextContent content={usage} />
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </div>
  );
};

export default ProductDescription;
