
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { StatsData } from "@/hooks/useReportsData";

interface ExportButtonsProps {
  statsData: StatsData;
  depositsChartData: any[];
  formattedDateRange: string;
  isLoading: boolean;
}

export function ExportButtons({
  statsData,
  depositsChartData,
  formattedDateRange,
  isLoading
}: ExportButtonsProps) {
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
    
    // Convert to CSV
    const csv = Papa.unparse(depositsData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `financial-data-${new Date().toISOString().slice(0, 10)}.csv`;
    saveAs(blob, fileName);
  };

  return (
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
  );
}
