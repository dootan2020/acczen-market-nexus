
export function PurchaseModalInfo() {
  return (
    <div className="rounded-lg bg-muted p-3 text-sm">
      <p className="mb-2 text-muted-foreground">Thông tin quan trọng:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Đơn hàng sẽ được xử lý ngay sau khi xác nhận</li>
        <li>Số dư tài khoản của bạn sẽ bị trừ tương ứng</li>
        <li>Bạn sẽ nhận được email xác nhận kèm thông tin sản phẩm</li>
      </ul>
    </div>
  );
}
