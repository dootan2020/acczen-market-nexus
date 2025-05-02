
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, Wallet, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface CheckoutCardProps {
  balanceUSD: number;
  totalUSD: number;
  hasEnoughBalance: boolean;
  isProcessing: boolean;
  onPurchase: () => void;
  isValid?: boolean;
}

const CheckoutCard: React.FC<CheckoutCardProps> = ({
  balanceUSD,
  totalUSD,
  hasEnoughBalance,
  isProcessing,
  onPurchase,
  isValid = true
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Thanh toán</CardTitle>
        <CardDescription>Hoàn tất đơn hàng của bạn</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số dư tài khoản</span>
            <span className="font-medium">${balanceUSD.toFixed(2)} USD</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tổng thanh toán</span>
            <span className="font-medium">${totalUSD.toFixed(2)} USD</span>
          </div>
          
          <div className="pt-2 border-t mt-2 flex justify-between items-center">
            <span className="font-medium">Số dư sau thanh toán</span>
            <span className={`font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-500'}`}>
              ${(balanceUSD - totalUSD).toFixed(2)} USD
            </span>
          </div>
        </div>

        {hasEnoughBalance ? (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Bạn có đủ số dư để hoàn tất đơn hàng này
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Số dư không đủ. Vui lòng nạp thêm tiền để tiếp tục.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full">
          <Button
            onClick={onPurchase}
            className="w-full"
            disabled={isProcessing || !hasEnoughBalance || !isValid}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Hoàn tất thanh toán"
            )}
          </Button>
        </div>

        {!hasEnoughBalance && (
          <div className="w-full">
            <Link to="/deposit">
              <Button className="w-full" variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                Nạp thêm tiền
              </Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CheckoutCard;
