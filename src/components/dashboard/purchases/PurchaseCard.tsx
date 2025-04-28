
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface PurchaseCardProps {
  id: string;
  date: string;
  productName: string;
  status: string;
  price: number;
  productKeys?: string[];
}

export const PurchaseCard = ({
  id,
  date,
  productName,
  status,
  price,
  productKeys,
}: PurchaseCardProps) => {
  const [showKeys, setShowKeys] = useState(false);
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();

  const handleCopyKeys = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{productName}</h3>
              <p className="text-sm text-muted-foreground">
                Order ID: {id}
              </p>
            </div>
            <Badge 
              className={`${
                status === 'completed' ? 'bg-green-100 text-green-800' : 
                status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100 text-gray-800'
              }`}
            >
              {formatStatus(status)}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
            <span className="font-medium">
              {formatUSD(convertVNDtoUSD(price))}
            </span>
          </div>

          {productKeys && productKeys.length > 0 && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeys(!showKeys)}
                >
                  {showKeys ? 'Hide Keys' : `Show Keys (${productKeys.length})`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyKeys(productKeys.join('\n'))}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>

              {showKeys && (
                <div className="space-y-2">
                  {productKeys.map((key, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <code className="text-xs font-mono break-all">
                        {key}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyKeys(key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
