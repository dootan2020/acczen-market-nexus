
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { format } from 'date-fns';
import { DiscountBadge } from './DiscountBadge';
import { 
  DollarSign, 
  Percent, 
  Shield, 
  Calendar, 
  Edit,
  User as UserIcon,
  Mail,
  UserCheck,
  CalendarClock
} from 'lucide-react';

interface UserDetailsProps {
  user: UserProfile | null;
  onEdit?: () => void;
  onAdjustBalance?: () => void;
  onSetDiscount?: () => void;
}

export function UserDetails({ user, onEdit, onAdjustBalance, onSetDiscount }: UserDetailsProps) {
  if (!user) return null;
  
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 pb-2 border-b">
          <CardTitle>User Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Username:</span>
                <span>{user.username || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Full Name:</span>
                <span>{user.full_name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span>{formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Account Status</h3>
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit} className="flex items-center gap-1">
                  <Edit className="h-3.5 w-3.5" />
                  Change Role
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Role:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Balance</h3>
              {onAdjustBalance && (
                <Button size="sm" variant="outline" onClick={onAdjustBalance} className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Adjust Balance
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Current Balance:</span>
              <span className="font-semibold">${user.balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Discount</h3>
              {onSetDiscount && (
                <Button size="sm" variant="outline" onClick={onSetDiscount} className="flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5" />
                  Update Discount
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Discount Rate:</span>
                {user.discount_percentage > 0 ? (
                  <DiscountBadge 
                    percentage={user.discount_percentage} 
                    tooltipContent={user.discount_note || "User discount"} 
                  />
                ) : (
                  <span>No discount</span>
                )}
              </div>
              {user.discount_expires_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{formatDate(user.discount_expires_at)}</span>
                </div>
              )}
              {user.discount_note && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Note:</span>
                  <span className="text-sm">{user.discount_note}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
