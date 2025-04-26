
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextContent from "@/components/RichTextContent";
import { Card, CardContent } from "@/components/ui/card";

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
  // Determine if we should show tabs based on available content
  const showTabs = specifications || usage;
  
  if (!description && !specifications && !usage) {
    return null;
  }

  return (
    <div className="mt-16 mb-12">
      <h2 className="text-2xl font-bold mb-6">Thông tin chi tiết sản phẩm</h2>
      
      {showTabs ? (
        <Card className="border shadow-sm">
          <Tabs defaultValue="description" className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="description" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                >
                  Mô tả
                </TabsTrigger>
                
                {specifications && (
                  <TabsTrigger 
                    value="specifications" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                  >
                    Thông số kỹ thuật
                  </TabsTrigger>
                )}
                
                {usage && (
                  <TabsTrigger 
                    value="usage" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                  >
                    Hướng dẫn sử dụng
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            
            <CardContent className="pt-6">
              <TabsContent value="description">
                <RichTextContent content={description} />
              </TabsContent>
              
              {specifications && (
                <TabsContent value="specifications">
                  <RichTextContent content={specifications} />
                </TabsContent>
              )}
              
              {usage && (
                <TabsContent value="usage">
                  <RichTextContent content={usage} />
                </TabsContent>
              )}
            </CardContent>
          </Tabs>
        </Card>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <RichTextContent content={description} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDescription;
