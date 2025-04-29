
import React from 'react';
import { NotificationPreferences } from '@/components/dashboard/notifications/NotificationPreferences';

const NotificationsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your email notification preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        <NotificationPreferences />
      </div>
    </div>
  );
};

export default NotificationsPage;
