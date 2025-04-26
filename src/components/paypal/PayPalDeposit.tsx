
import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { PAYPAL_OPTIONS } from './paypal-config';
import { PayPalButtonWrapper } from './PayPalButtonWrapper';
import { PayPalErrorBoundary } from './PayPalErrorBoundary';

const PayPalDeposit = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const presetAmounts = [10, 20, 50, 100];
  const FEE_PERCENTAGE = 0.044; // 4.4%
  const FEE_FIXED = 0.30; // $0.30 USD

  const calculateTotal = (amount: number) => {
    if (amount <= 0) return 0;
    const fee = (amount * FEE_PERCENTAGE) + FEE_FIXED;
    return Number((amount + fee).toFixed(2));
  };

  useEffect(() => {
    const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    setTotalAmount(calculateTotal(amount));
  }, [selectedAmount, customAmount]);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="text-center space-y-2">
            <img 
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_200x51.png" 
              alt="PayPal Logo"
              className="h-12 mx-auto"
            />
            <h2 className="text-2xl font-semibold">Nạp tiền qua PayPal</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Số tiền muốn nạp (USD)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Nhập số tiền..."
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  onClick={() => handlePresetAmount(presetAmount)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedAmount === presetAmount
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-gray-200 hover:border-primary text-gray-700'
                  }`}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="text-sm text-gray-600">
                Phí giao dịch: {(FEE_PERCENTAGE * 100).toFixed(1)}% + {FEE_FIXED.toFixed(2)} USD
              </div>
              <div className="text-lg font-semibold">
                Tổng thanh toán: {totalAmount.toFixed(2)} USD
              </div>
            </div>

            {amount > 0 && (
              <div className="pt-2">
                <PayPalErrorBoundary amount={amount} onSuccess={() => {}}>
                  <PayPalButtonWrapper amount={amount} onSuccess={() => {}} />
                </PayPalErrorBoundary>
              </div>
            )}

            <div className="text-center space-y-4">
              <a href="/deposit" className="text-accent hover:underline text-sm">
                Chọn phương thức khác
              </a>
              
              <div className="flex items-center justify-center text-sm text-gray-500 gap-1">
                <Lock className="h-4 w-4" />
                <span>Kết nối bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalDeposit;
