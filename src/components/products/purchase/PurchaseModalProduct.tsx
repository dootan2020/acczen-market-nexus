
interface PurchaseModalProductProps {
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  formatPrice?: (amount: number) => string;
}

export function PurchaseModalProduct({
  productName,
  productImage,
  quantity,
  totalPrice,
  formatPrice
}: PurchaseModalProductProps) {
  // Format price using provided function or fallback to default Vietnamese format
  const formattedPrice = formatPrice 
    ? formatPrice(totalPrice) 
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice);

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
        <img
          src={productImage}
          alt={productName}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div>
        <h3 className="font-medium leading-tight">{productName}</h3>
        <p className="text-sm text-muted-foreground">
          Số lượng: {quantity}
        </p>
        <p className="font-medium text-primary">
          {formattedPrice}
        </p>
      </div>
    </div>
  );
}
