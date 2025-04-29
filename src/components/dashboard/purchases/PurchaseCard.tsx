
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ProductKeys } from "./ProductKeys";
import { formatCurrency } from "@/utils/formatters";
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
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
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  
  const displayedPrice = typeof convertVNDtoUSD === 'function' ? 
    formatUSD(convertVNDtoUSD(price)) : 
    `$${Number(price).toFixed(2)}`;

  return (
    <Card className="w-full bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{productName}</h3>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(date).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {displayedPrice}
              </div>
              <Link 
                to={`/orders/${id}`}
                className="text-sm text-primary flex items-center hover:underline"
              >
                <span>Details</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>

          {productKeys && productKeys.length > 0 && (
            <ProductKeys keys={productKeys} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
