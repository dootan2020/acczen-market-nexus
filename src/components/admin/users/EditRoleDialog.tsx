
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile } from "@/hooks/admin/types/userManagement.types";

export interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (role: "admin" | "user") => void;
  isLoading?: boolean;
  currentUser?: UserProfile | null;
}

export function EditRoleDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  currentUser
}: EditRoleDialogProps) {
  const [role, setRole] = useState<"admin" | "user">(
    currentUser?.role || "user"
  );

  const handleSubmit = () => {
    onConfirm(role);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {currentUser?.username || currentUser?.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={role}
            onValueChange={(value) => setRole(value as "admin" | "user")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
