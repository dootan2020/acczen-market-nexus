
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { APISettings } from "@/components/admin/settings/APISettings";
import { EmailTemplates } from "@/components/admin/settings/EmailTemplates";
import { PaymentSettings } from "@/components/admin/settings/PaymentSettings";
import { SecuritySettings } from "@/components/admin/settings/SecuritySettings";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings, API connections, email templates, payment methods, and security.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm animate-fade-in">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full bg-muted/50 p-0 h-auto flex overflow-x-auto">
            <TabsTrigger 
              value="general"
              className="flex-1 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none border-r last:border-r able data-[state=active]:text-chatgpt-primary py-3"
            >
              General Settings
            </TabsTrigger>
            <TabsTrigger 
              value="api"
              className="flex-1 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none border-r last:border-r data-[state=active]:text-chatgpt-primary py-3"
            >
              API Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="email"
              className="flex-1 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none border-r last:border-r data-[state=active]:text-chatgpt-primary py-3"
            >
              Email Templates
            </TabsTrigger>
            <TabsTrigger 
              value="payment"
              className="flex-1 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none border-r last:border-r data-[state=active]:text-chatgpt-primary py-3"
            >
              Payment Methods
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="flex-1 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-none data-[state=active]:text-chatgpt-primary py-3"
            >
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="p-6">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="api" className="p-6">
            <APISettings />
          </TabsContent>
          
          <TabsContent value="email" className="p-6">
            <EmailTemplates />
          </TabsContent>
          
          <TabsContent value="payment" className="p-6">
            <PaymentSettings />
          </TabsContent>
          
          <TabsContent value="security" className="p-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
