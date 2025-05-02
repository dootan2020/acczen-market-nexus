
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductDescription from './ProductDescription';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShieldCheck, HelpCircle, Star } from 'lucide-react';

interface ProductTabsProps {
  description: string;
  technicalDetails?: string;
  usageInstructions?: string;
  warrantyInfo?: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  description,
  technicalDetails,
  usageInstructions,
  warrantyInfo
}) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="description" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">Description</span>
        </TabsTrigger>
        <TabsTrigger value="technical" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Technical Details</span>
        </TabsTrigger>
        <TabsTrigger value="usage" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Usage Guide</span>
        </TabsTrigger>
        <TabsTrigger value="warranty" className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Warranty</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="rounded-md p-4 border">
        <h3 className="text-xl font-semibold mb-4 font-poppins">Product Description</h3>
        <ProductDescription description={description} />
      </TabsContent>
      <TabsContent value="technical" className="rounded-md p-4 border">
        <h3 className="text-xl font-semibold mb-4 font-poppins">Technical Details</h3>
        {technicalDetails ? (
          <ProductDescription description={technicalDetails} />
        ) : (
          <p className="text-gray-500 italic">Technical details are not available for this product.</p>
        )}
      </TabsContent>
      <TabsContent value="usage" className="rounded-md p-4 border">
        <h3 className="text-xl font-semibold mb-4 font-poppins">Usage Instructions</h3>
        {usageInstructions ? (
          <ProductDescription description={usageInstructions} />
        ) : (
          <div className="space-y-4">
            <p>This product is ready for immediate use after purchase. Follow these general steps:</p>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Complete your purchase and receive your product key or access information</li>
              <li>Follow the activation instructions provided in your email</li>
              <li>For technical assistance, contact our support team</li>
            </ol>
            <Badge className="bg-amber-500 mt-2">Note: Specific usage instructions will be provided after purchase</Badge>
          </div>
        )}
      </TabsContent>
      <TabsContent value="warranty" className="rounded-md p-4 border">
        <h3 className="text-xl font-semibold mb-4 font-poppins">Warranty Policy</h3>
        {warrantyInfo ? (
          <ProductDescription description={warrantyInfo} />
        ) : (
          <div className="space-y-4">
            <p>All digital products come with:</p>
            <ul className="list-disc ml-5 space-y-2">
              <li>48-hour replacement guarantee for non-functional products</li>
              <li>Technical support for 30 days after purchase</li>
              <li>100% satisfaction guarantee</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              For warranty claims, please contact our support team with your order number and details of the issue.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
