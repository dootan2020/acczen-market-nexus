
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  category?: {
    name?: string;
  };
  stock_quantity: number;
  status?: string;
}

interface RelatedProductsProps {
  categoryId?: string;
  currentProductId?: string;
  products?: Product[];
  showTitle?: boolean;
}

const RelatedProducts = ({ 
  categoryId, 
  currentProductId, 
  products = [], 
  showTitle = false
}: RelatedProductsProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      {showTitle && (
        <h2 className="text-xl font-semibold mb-6 text-[#343541] font-poppins">
          Related Products
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image_url || '/placeholder.svg'}
            price={product.price}
            category={product.category?.name || ''}
            stock={product.stock_quantity}
            featured={product.status === 'active' && product.stock_quantity > 0}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
