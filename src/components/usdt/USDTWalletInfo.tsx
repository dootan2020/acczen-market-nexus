
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface USDTWalletInfoProps {
  walletAddress: string;
}

export const USDTWalletInfo = ({ walletAddress }: USDTWalletInfoProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Wallet address copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 items-stretch">
          <div className="bg-primary/5 p-4 flex justify-center items-center">
            <div className="bg-white p-2 rounded-md">
              <QRCodeSVG 
                value={`tron:${walletAddress}`}
                size={150}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium mb-1">TRC20 Wallet Address</p>
            <p className="font-mono text-xs bg-muted p-2 rounded overflow-x-auto break-all mb-2">
              {walletAddress}
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-1"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5 text-green-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" /> Copy Address
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
