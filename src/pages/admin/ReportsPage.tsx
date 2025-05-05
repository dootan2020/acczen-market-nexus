
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminReports from './AdminReports';
import ApiHealthMonitor from '@/components/admin/monitoring/ApiHealthMonitor';

const ReportsPage: React.FC = () => {
  return (
    <Tabs defaultValue="reports" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="api-health">API Health</TabsTrigger>
      </TabsList>
      <TabsContent value="reports">
        <AdminReports />
      </TabsContent>
      <TabsContent value="api-health">
        <ApiHealthMonitor />
      </TabsContent>
    </Tabs>
  );
};

export default ReportsPage;
