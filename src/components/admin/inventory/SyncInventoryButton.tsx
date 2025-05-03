
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useInventorySync } from "@/hooks/useInventorySync";

export interface SyncInventoryButtonProps {
  onSync?: () => Promise<void>;
  kioskToken?: string;
  productName?: string;
  onSuccess?: () => void;
}

const SyncInventoryButton: React.FC<SyncInventoryButtonProps> = ({ 
  onSync, 
  kioskToken, 
  productName = "Inventory", 
  onSuccess 
}) => {
  const [isPending, setIsPending] = useState(false);
  const { syncProductStock } = useInventorySync();

  const handleSyncClick = async () => {
    setIsPending(true);
    try {
      // If onSync is provided, use it, otherwise use the hook's syncProductStock
      if (onSync) {
        await onSync();
        toast.success("Inventory sync started", {
          description: "The inventory is being synced in the background.",
        });
      } else if (kioskToken) {
        const result = await syncProductStock(kioskToken);
        if (result.success) {
          toast.success(`${productName} synced successfully`, {
            description: result.message,
          });
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast.error(`Failed to sync ${productName}`, {
            description: result.message || "Please try again later.",
          });
        }
      } else {
        toast.error("Sync failed", {
          description: "No sync method or kiosk token provided.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to sync inventory", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleSyncClick}
      disabled={isPending}
      className="ml-2"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-3 w-3" />
          Sync now
        </>
      )}
    </Button>
  );
};

export default SyncInventoryButton;
