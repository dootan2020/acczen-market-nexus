
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';

export function AccountOverview() {
  const { user } = useAuth();
  
  // Format the date the user joined
  const joinDate = user?.created_at ? format(new Date(user.created_at), 'MMMM dd, yyyy') : 'N/A';
  
  return (
    <Card className="shadow-sm border-primary/10 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="text-base font-medium">{user?.username || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-base font-medium">{user?.email || 'Not available'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="text-base font-medium">{joinDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account Status</p>
            <p className="text-base font-medium">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Active
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
