
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    }
  });
};

const FeaturedProducts = () => {
  const { data: products, isLoading, error } = useFeaturedProducts();

  if (isLoading) {
    return (
      <div className="bg-[#F7F7F8] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="relative w-full">
                  <div className="aspect-[4/3] bg-gray-200 rounded animate-pulse mb-4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#F7F7F8] py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-[#202123]">Featured Products</h2>
          <Button variant="ghost" className="flex items-center gap-1 text-[#19C37D] hover:bg-[#F7F7F8]/80">
            <Link to="/products" className="flex items-center">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <ProductCard
                id={product.id}
                name={product.name}
                image={product.image_url || ''}
                price={product.price}
                salePrice={product.sale_price}
                category={product.category?.name || ''}
                stock={product.stock_quantity}
                featured={product.status === 'active' && product.stock_quantity > 0}
                isNew={new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                isBestSeller={product.sold_count > 5}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Button className="bg-[#19C37D] hover:bg-[#15a76b]">
            <Link to="/products" className="flex items-center">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
