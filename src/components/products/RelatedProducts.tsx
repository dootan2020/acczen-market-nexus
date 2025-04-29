
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
}

const RelatedProducts = ({ categoryId, currentProductId, products = [] }: RelatedProductsProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
