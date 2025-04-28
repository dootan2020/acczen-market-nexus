
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ProductKeysProps {
  keys: string[];
}

export const ProductKeys = ({ keys }: ProductKeysProps) => {
  const [showKeys, setShowKeys] = useState(false);

  const handleCopyKeys = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  if (!keys || keys.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowKeys(!showKeys)}
        >
          {showKeys ? 'Hide Keys' : `Show Keys (${keys.length})`}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyKeys(keys.join('\n'))}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy All
        </Button>
      </div>

      {showKeys && (
        <div className="space-y-2">
          {keys.map((key, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-muted rounded-md"
            >
              <code className="text-xs font-mono break-all">
                {key}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyKeys(key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
