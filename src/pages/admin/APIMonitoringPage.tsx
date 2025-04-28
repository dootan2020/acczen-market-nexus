
import React from 'react';
import { ApiMonitoring } from '@/components/admin/monitoring/ApiMonitoring';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectionTest } from '@/hooks/taphoammo/useConnectionTest';

const APIMonitoringPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { testConnection } = useConnectionTest();
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bạn không có quyền truy cập vào trang này.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="pt-6">
          <ApiMonitoring />
        </CardContent>
      </Card>
    </div>
  );
};

export default APIMonitoringPage;
