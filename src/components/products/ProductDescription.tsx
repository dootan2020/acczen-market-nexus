import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextContent from "@/components/RichTextContent";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Code } from "lucide-react";

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
    <div className="mt-16 mb-12">
      <h2 className="text-2xl font-bold mb-6">Thông tin chi tiết sản phẩm</h2>
      
      <Card className="border shadow-sm">
        <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="h-auto p-0 bg-transparent w-full flex justify-start overflow-x-auto">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 flex items-center gap-2"
              >
                <span className="sm:hidden">Mô tả</span>
                <span className="hidden sm:inline">Mô tả sản phẩm</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                <span className="sm:hidden">Đánh giá</span>
                <span className="hidden sm:inline">Đánh giá sản phẩm</span>
              </TabsTrigger>
              
              {specifications && (
                <TabsTrigger 
                  value="specifications" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  <span className="sm:hidden">Thông số</span>
                  <span className="hidden sm:inline">Thông số kỹ thuật</span>
                </TabsTrigger>
              )}
              
              {usage && (
                <TabsTrigger 
                  value="usage" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 flex items-center gap-2"
                >
                  <span className="sm:hidden">Hướng dẫn</span>
                  <span className="hidden sm:inline">Hướng dẫn sử dụng</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <CardContent className="pt-6">
            <TabsContent value="description" className="mt-0">
              <div className="max-w-none prose-headings:text-foreground prose-a:text-primary">
                <RichTextContent content={description} />
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-0">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <h3 className="text-lg font-semibold mb-1">Đánh giá trung bình</h3>
                    <div className="text-4xl font-bold text-primary mb-2">{reviews.average}</div>
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
                    <div className="text-sm text-muted-foreground">
                      {reviews.count} đánh giá
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h3 className="text-lg font-semibold mb-4">Phân phối đánh giá</h3>
                  
                  <div className="space-y-3">
                    {reviews.distribution.map((item) => (
                      <div key={item.stars} className="flex items-center gap-2">
                        <div className="w-12 text-sm font-medium">{item.stars} sao</div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(item.count / maxReviewCount) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-10 text-sm text-right">{item.count}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Viết đánh giá
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Reviews list would go here - not implemented in this version */}
            </TabsContent>
            
            {specifications && (
              <TabsContent value="specifications" className="mt-0">
                <RichTextContent content={specifications} />
              </TabsContent>
            )}
            
            {usage && (
              <TabsContent value="usage" className="mt-0">
                <RichTextContent content={usage} />
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

const Button = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string 
}) => {
  return (
    <button className={`px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center ${className}`}>
      {children}
    </button>
  );
};

export default ProductDescription;
