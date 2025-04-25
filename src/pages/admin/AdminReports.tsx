import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportsData } from "@/hooks/useReportsData";
import { ReportFilters } from "@/components/admin/reports/ReportFilters";
import { ReportOverview } from "@/components/admin/reports/ReportOverview";
import { DepositsReport } from "@/components/admin/reports/DepositsReport";
import { OrdersReport } from "@/components/admin/reports/OrdersReport";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const AdminReports = () => {
  const {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    formattedDateRange,
    statsData,
    depositsChartData,
    ordersChartData,
    paymentMethodData,
    isLoading,
    refetch
  } = useReportsData();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(18);
    doc.text("Digital Deals Hub - Financial Reports", 14, 22);
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Date range: ${formattedDateRange}`, 14, 30);
    
    // Summary data
    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    
    const summaryData = [
      ['Total Deposits', `$${statsData.totalDepositAmount.toFixed(2)}`],
      ['Total Deposits Count', statsData.totalDeposits.toString()],
      ['PayPal Deposits', `$${statsData.paypalAmount.toFixed(2)}`],
      ['USDT Deposits', `$${statsData.usdtAmount.toFixed(2)}`],
      ['Total Orders', statsData.totalOrders.toString()],
      ['Average Order Value', `$${statsData.averageOrderValue.toFixed(2)}`],
      ['Active Users', `${statsData.activeUsers} / ${statsData.totalUsers}`],
      ['Conversion Rate', `${statsData.conversionRate}%`]
    ];
    
    (doc as any).autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 }
    });
    
    // Export to file
    const fileName = `financial-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };
  
  // Export to CSV function
  const exportToCSV = () => {
    // Prepare deposits data
    const depositsData = depositsChartData.map(day => ({
      date: day.date,
      depositsAmount: day.amount,
      depositsCount: day.count,
    }));
    
    // Prepare orders data
    const ordersData = ordersChartData.map(day => ({
      date: day.date,
      ordersAmount: day.amount,
      ordersCount: day.count,
    }));
    
    // Combine data by date
    const combinedData: Array<{
      date: string;
      depositsAmount: number;
      depositsCount: number;
      ordersAmount?: number;
      ordersCount?: number;
    }> = [...depositsData];

    ordersData.forEach(orderDay => {
      const existingDay = combinedData.find(d => d.date === orderDay.date);
      if (existingDay) {
        existingDay.ordersAmount = orderDay.ordersAmount;
        existingDay.ordersCount = orderDay.ordersCount;
      } else {
        combinedData.push({
          date: orderDay.date,
          depositsAmount: 0,
          depositsCount: 0,
          ordersAmount: orderDay.ordersAmount,
          ordersCount: orderDay.ordersCount,
        });
      }
    });
    
    // Sort by date
    combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Convert to CSV
    const csv = Papa.unparse(combinedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `financial-data-${new Date().toISOString().slice(0, 10)}.csv`;
    saveAs(blob, fileName);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Analyze user activity, deposits, and orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <ReportFilters 
            dateRangeType={dateRangeType}
            onDateRangeChange={handleDateRangeChange}
            dateRange={dateRange}
            onDateRangePickerChange={handleDateRangePickerChange}
            onRefresh={refetch}
            isLoading={isLoading}
          />
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={isLoading}>
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF} disabled={isLoading}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
      
      {formattedDateRange && (
        <div className="text-sm text-muted-foreground mb-4">
          Showing data for: <span className="font-medium">{formattedDateRange}</span>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ReportOverview
            statsData={statsData}
            paymentMethodData={paymentMethodData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="deposits">
          <DepositsReport 
            depositsChartData={depositsChartData} 
            isLoading={isLoading}
            depositsData={depositsChartData}
          />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersReport
            ordersChartData={ordersChartData}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
      
      {isLoading && (
        <Card className="mt-4">
          <CardContent className="py-4 text-center">
            <p className="text-muted-foreground">Loading data, please wait...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReports;
