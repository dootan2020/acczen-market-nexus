
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile } from '@/hooks/admin/types/userManagement.types';

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (role: UserProfile['role']) => void;
  isLoading: boolean;
  currentUser: UserProfile | null;
}

export function EditRoleDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  currentUser,
}: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>(
    currentUser?.role || 'user'
  );

  // Update selected role when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setSelectedRole(currentUser.role);
    }
  }, [currentUser]);

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for user: {currentUser?.email || 'Selected user'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserProfile['role'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="content_manager">Content Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
