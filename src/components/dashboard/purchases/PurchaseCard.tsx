
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ProductKeys } from "./ProductKeys";
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
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();

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
            <StatusBadge status={status} />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
            <span className="font-medium">
              {formatUSD(convertVNDtoUSD(price))}
            </span>
          </div>

          {productKeys && <ProductKeys keys={productKeys} />}
        </div>
      </CardContent>
    </Card>
  );
};
