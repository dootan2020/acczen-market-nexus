
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface USDTWalletInfoProps {
  walletAddress: string;
}

export const USDTWalletInfo: React.FC<USDTWalletInfoProps> = ({
  walletAddress,
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Đã sao chép', {
        description: 'Địa chỉ ví đã được sao chép vào clipboard'
      });
    } catch (err) {
      toast.error('Lỗi sao chép', {
        description: 'Không thể sao chép địa chỉ ví'
      });
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-medium text-muted-foreground">
          Địa chỉ ví USDT (TRC20):
        </Label>
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="relative">
              <div className="bg-background p-4 rounded-lg break-all font-mono text-sm">
                {walletAddress}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => copyToClipboard(walletAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="p-4 bg-white rounded-xl shadow-sm border border-border/40 w-fit">
          <QRCodeSVG value={walletAddress} size={180} />
        </Card>
      </div>
    </div>
  );
};
