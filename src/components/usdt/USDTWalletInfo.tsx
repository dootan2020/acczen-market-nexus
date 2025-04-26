
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { toast } from "sonner";

interface USDTWalletInfoProps {
  walletAddress: string;
}

export const USDTWalletInfo: React.FC<USDTWalletInfoProps> = ({
  walletAddress,
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Address Copied', {
        description: 'Wallet address copied to clipboard'
      });
    } catch (err) {
      toast.error('Copy Failed', {
        description: 'Could not copy address to clipboard'
      });
    }
  };

  return (
    <div className="text-center">
      <p className="text-sm font-medium mb-2">Địa chỉ ví USDT (TRC20):</p>
      <div className="relative">
        <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm">
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

      <div className="mt-6 mb-4 flex justify-center">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-border/40">
          <QRCodeSVG value={walletAddress} size={180} />
        </div>
      </div>
    </div>
  );
};
