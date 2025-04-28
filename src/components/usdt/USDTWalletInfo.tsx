
import React, { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react'; // Fixed import

interface USDTWalletInfoProps {
  walletAddress: string;
}

export function USDTWalletInfo({ walletAddress }: USDTWalletInfoProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Địa chỉ ví USDT (TRC20):</h3>
      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md break-all">
        <code className="text-sm font-mono flex-1">{walletAddress}</code>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy address</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setShowQR(!showQR)}
        >
          <QrCode className="h-4 w-4" />
          <span className="sr-only">Show QR code</span>
        </Button>
      </div>

      {showQR && (
        <div className="flex justify-center p-4 bg-white rounded-md">
          <div className="border border-border p-2 rounded">
            <QRCodeSVG value={walletAddress} size={200} />
          </div>
        </div>
      )}
    </div>
  );
}
