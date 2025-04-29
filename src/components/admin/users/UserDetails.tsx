
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  UserCog, 
  CircleDollarSign, 
  Package, 
  CreditCard, 
  Calendar, 
  Mail, 
  User2,
  Percent,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { DiscountBadge } from './DiscountBadge';
import { useUserDiscount } from '@/hooks/admin/useUserDiscount';
import { DiscountHistoryTable } from './DiscountHistoryTable';
import { ResetUserDiscountButton } from './ResetUserDiscountButton';

interface UserDetailsProps {
  user: UserProfile;
  onEdit: () => void;
  onAdjustBalance: () => void;
  onSetDiscount: () => void;
}

export function UserDetails({ user, onEdit, onAdjustBalance, onSetDiscount }: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { discountHistory, isLoadingHistory } = useUserDiscount(user.id);
  
  const getInitials = (name: string | null = '', email: string | null = '') => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return email ? email[0].toUpperCase() : 'U';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const isTemporaryDiscount = user.discount_percentage > 0 && user.discount_expires_at;
  const daysUntilExpiry = isTemporaryDiscount ? 
    Math.ceil((new Date(user.discount_expires_at!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* User profile card */}
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Profile</CardTitle>
            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
          <CardDescription>User details and information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username || ''} />
            <AvatarFallback className="text-xl">{getInitials(user.full_name, user.email)}</AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-medium">{user.full_name || user.username || 'Unnamed User'}</h3>
          
          {user.discount_percentage > 0 && (
            <div className="mt-3 flex flex-col items-center">
              <DiscountBadge 
                percentage={user.discount_percentage} 
                size="lg"
                tooltipContent={user.discount_note ? `Reason: ${user.discount_note}` : undefined}
              />
              
              {isTemporaryDiscount && (
                <div className={`mt-2 flex items-center text-xs ${
                  daysUntilExpiry < 3 ? 'text-red-500' : 'text-amber-500'
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {daysUntilExpiry < 0 
                    ? 'Expired! Will be reset automatically.'
                    : daysUntilExpiry === 0 
                      ? 'Expires today'
                      : `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
                  }
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 space-y-2 w-full">
            <div className="flex items-center justify-start border-t pt-2">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm break-all">{user.email || 'No email'}</span>
            </div>
            
            <div className="flex items-center justify-start border-t pt-2">
              <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{user.username || 'No username'}</span>
            </div>
            
            <div className="flex items-center justify-start border-t pt-2">
              <CircleDollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">${user.balance.toFixed(2)} balance</span>
            </div>
            
            <div className="flex items-center justify-start border-t pt-2">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Joined {formatDate(user.created_at)}</span>
            </div>
            
            {user.discount_percentage > 0 && (
              <>
                <div className="flex items-center justify-start border-t pt-2">
                  <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {user.discount_percentage}% discount
                    {isTemporaryDiscount && ` until ${formatDate(user.discount_expires_at)}`}
                  </span>
                </div>
                
                {user.discount_updated_at && (
                  <div className="flex items-center justify-start pt-1">
                    <div className="w-4 mr-2" />
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDate(user.discount_updated_at)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button onClick={onEdit} className="flex-1">
              <UserCog className="mr-1 h-4 w-4" />
              Change Role
            </Button>
            <Button onClick={onAdjustBalance} variant="outline" className="flex-1">
              <CircleDollarSign className="mr-1 h-4 w-4" />
              Adjust Balance
            </Button>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button onClick={onSetDiscount} variant="secondary" className="flex-1">
              <Percent className="mr-1 h-4 w-4" />
              {user.discount_percentage > 0 ? 'Update Discount' : 'Set Discount'}
            </Button>
            
            {user.discount_percentage > 0 && (
              <ResetUserDiscountButton 
                userId={user.id} 
                username={user.username || user.email || undefined}
                variant="outline"
                size="default"
              />
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Tabs for user details */}
      <div className="md:col-span-2">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="discount-history">Discount History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>Summary of user activity and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                    <div className="flex items-center mt-1">
                      <Package className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-2xl font-bold">0</span>
                    </div>
                  </div>
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Spend</span>
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-2xl font-bold">$0.00</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Most Recent Activity</h3>
                  <div className="text-sm text-muted-foreground">No recent activity to display.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View all orders placed by this user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-8">
                  No orders found for this user.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discount-history">
            <DiscountHistoryTable 
              history={discountHistory || []}
              isLoading={isLoadingHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
