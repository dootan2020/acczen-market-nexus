import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface SyncInventoryButtonProps {
  onSync: () => Promise<void>;
}

const SyncInventoryButton: React.FC<SyncInventoryButtonProps> = ({ onSync }) => {
  const [isPending, setIsPending] = useState(false);

  const handleSyncClick = async () => {
    setIsPending(true);
    try {
      await onSync();
      toast.success("Inventory sync started", {
        description: "The inventory is being synced in the background.",
      });
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
