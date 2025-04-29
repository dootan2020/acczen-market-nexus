
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Integrations</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>
            Connect your store with external services and marketplaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium">TaphoaMMO Integration</h3>
              <p className="text-muted-foreground mt-1">
                Connect to TaphoaMMO to automatically import products and process orders
              </p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Status: Connected</p>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium">Payment Gateway</h3>
              <p className="text-muted-foreground mt-1">
                Configure payment providers for your store
              </p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Status: Configured</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;
