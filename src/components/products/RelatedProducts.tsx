
import ProductCard from "@/components/ProductCard";
import { useRelatedProducts } from "@/hooks/useProduct";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const { data: relatedProducts } = useRelatedProducts(categoryId, currentProductId);

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image_url || ''}
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
