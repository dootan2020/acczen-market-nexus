
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextContent from "@/components/RichTextContent";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Code, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  
  const hasNoContent = (content?: string | null) => {
    if (!content) return true;
    return content.trim().length === 0;
  };

  const TabIcon = ({ icon, isActive }: { icon: React.ReactNode, isActive: boolean }) => (
    <div className={cn(
      "w-8 h-8 flex items-center justify-center rounded-full mr-2 transition-colors",
      isActive ? "bg-primary/20" : "bg-gray-100"
    )}>
      {icon}
    </div>
  );
  
  return (
    <div className="w-full">
      <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-gray-50 rounded-t-lg">
          <TabsList className="h-auto p-2 bg-transparent w-full flex justify-start overflow-x-auto gap-2">
            <TabsTrigger 
              value="description" 
              className={cn(
                "rounded-md data-[state=active]:border-b-0 data-[state=active]:text-primary data-[state=active]:bg-white px-4 py-3 flex items-center gap-2 font-medium transition-all duration-300",
                activeTab === "description" ? "shadow-sm" : ""
              )}
            >
              <TabIcon 
                icon={<FileText className={cn("w-4 h-4", activeTab === "description" ? "text-primary" : "text-gray-500")} />}
                isActive={activeTab === "description"}
              />
              <span className="font-poppins">Mô tả sản phẩm</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="reviews" 
              className={cn(
                "rounded-md data-[state=active]:border-b-0 data-[state=active]:text-primary data-[state=active]:bg-white px-4 py-3 flex items-center gap-2 font-medium transition-all duration-300",
                activeTab === "reviews" ? "shadow-sm" : ""
              )}
            >
              <TabIcon 
                icon={<Star className={cn("w-4 h-4", activeTab === "reviews" ? "text-primary" : "text-gray-500")} />}
                isActive={activeTab === "reviews"}
              />
              <span className="font-poppins">Đánh giá sản phẩm</span>
            </TabsTrigger>
            
            {!hasNoContent(specifications) && (
              <TabsTrigger 
                value="specifications" 
                className={cn(
                  "rounded-md data-[state=active]:border-b-0 data-[state=active]:text-primary data-[state=active]:bg-white px-4 py-3 flex items-center gap-2 font-medium transition-all duration-300",
                  activeTab === "specifications" ? "shadow-sm" : ""
                )}
              >
                <TabIcon 
                  icon={<Code className={cn("w-4 h-4", activeTab === "specifications" ? "text-primary" : "text-gray-500")} />}
                  isActive={activeTab === "specifications"}
                />
                <span className="font-poppins">Thông số kỹ thuật</span>
              </TabsTrigger>
            )}
            
            {!hasNoContent(usage) && (
              <TabsTrigger 
                value="usage" 
                className={cn(
                  "rounded-md data-[state=active]:border-b-0 data-[state=active]:text-primary data-[state=active]:bg-white px-4 py-3 flex items-center gap-2 font-medium transition-all duration-300",
                  activeTab === "usage" ? "shadow-sm" : ""
                )}
              >
                <TabIcon 
                  icon={<BookOpen className={cn("w-4 h-4", activeTab === "usage" ? "text-primary" : "text-gray-500")} />}
                  isActive={activeTab === "usage"}
                />
                <span className="font-poppins">Hướng dẫn sử dụng</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <div className="bg-white rounded-b-lg">
          <TabsContent value="description" className="mt-0 animate-fade-in p-6">
            <div className="max-w-none">
              <RichTextContent content={description} className="prose-headings:text-gray-800 prose-p:text-gray-600" />
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-0 animate-fade-in p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-1 font-poppins">Đánh giá trung bình</h3>
                  <div className="text-4xl font-bold text-primary mb-2 font-poppins">{reviews.average}</div>
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
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(item.count / maxReviewCount) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-sm text-right font-inter">{item.count}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button className="bg-accent hover:bg-accent/80 transition-colors">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Viết đánh giá
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {!hasNoContent(specifications) && (
            <TabsContent value="specifications" className="mt-0 animate-fade-in p-6">
              <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-gray-800 prose-p:text-gray-600">
                <RichTextContent content={specifications || ''} />
              </div>
            </TabsContent>
          )}
          
          {!hasNoContent(usage) && (
            <TabsContent value="usage" className="mt-0 animate-fade-in p-6">
              <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-gray-800 prose-p:text-gray-600">
                <RichTextContent content={usage || ''} />
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default ProductDescription;
