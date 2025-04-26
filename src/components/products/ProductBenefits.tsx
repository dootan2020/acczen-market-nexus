
import { Package, Shield, Clock } from "lucide-react";

const ProductBenefits = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex items-center p-4 border rounded-lg">
        <Package className="h-8 w-8 text-primary mr-3" />
        <div>
          <h3 className="font-medium">Giao hàng tức thì</h3>
          <p className="text-sm text-muted-foreground">Nhận hàng qua email</p>
        </div>
      </div>
      <div className="flex items-center p-4 border rounded-lg">
        <Shield className="h-8 w-8 text-primary mr-3" />
        <div>
          <h3 className="font-medium">Bảo đảm 100%</h3>
          <p className="text-sm text-muted-foreground">Hoàn tiền nếu có vấn đề</p>
        </div>
      </div>
      <div className="flex items-center p-4 border rounded-lg">
        <Clock className="h-8 w-8 text-primary mr-3" />
        <div>
          <h3 className="font-medium">Hỗ trợ 24/7</h3>
          <p className="text-sm text-muted-foreground">Luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>
    </div>
  );
};

export default ProductBenefits;
