
import { Package, Shield, Clock, CreditCard } from "lucide-react";

const ProductBenefits = () => {
  return (
    <div className="my-10 bg-secondary/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-center">Ưu đãi khi mua sắm tại AccZen</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center p-4 border border-border bg-background rounded-lg shadow-sm transition-transform hover:scale-105">
          <Package className="h-9 w-9 text-primary shrink-0 mr-4" />
          <div>
            <h4 className="font-medium">Giao hàng tức thì</h4>
            <p className="text-sm text-muted-foreground">Nhận hàng ngay qua email</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border border-border bg-background rounded-lg shadow-sm transition-transform hover:scale-105">
          <Shield className="h-9 w-9 text-primary shrink-0 mr-4" />
          <div>
            <h4 className="font-medium">Bảo đảm 100%</h4>
            <p className="text-sm text-muted-foreground">Hoàn tiền nếu có vấn đề</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border border-border bg-background rounded-lg shadow-sm transition-transform hover:scale-105">
          <Clock className="h-9 w-9 text-primary shrink-0 mr-4" />
          <div>
            <h4 className="font-medium">Hỗ trợ 24/7</h4>
            <p className="text-sm text-muted-foreground">Luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border border-border bg-background rounded-lg shadow-sm transition-transform hover:scale-105">
          <CreditCard className="h-9 w-9 text-primary shrink-0 mr-4" />
          <div>
            <h4 className="font-medium">Thanh toán an toàn</h4>
            <p className="text-sm text-muted-foreground">Nhiều phương thức thanh toán</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBenefits;
