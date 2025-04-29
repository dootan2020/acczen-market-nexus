
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { type DateRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonsProps {
  data: any[];
  fileName: string;
  dateRange: DateRange;
}

export default function ExportButtons({ data, fileName, dateRange }: ExportButtonsProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }
    
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    
    const normalizedData = data.map(item => {
      // Create a simpler object for CSV export
      const normalized: Record<string, any> = {};
      
      Object.entries(item).forEach(([key, value]) => {
        // Skip complex objects and arrays
        if (typeof value !== 'object' || value === null) {
          normalized[key] = value;
        } else if (Array.isArray(value)) {
          normalized[key] = JSON.stringify(value);
        } else if (key === 'date' && typeof value === 'string') {
          normalized[key] = value;
        }
      });
      
      return normalized;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(normalizedData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: fileType });
    
    FileSaver.saveAs(fileData, `${fileName}${fileExtension}`);
  };
  
  const exportToPDF = () => {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }
    
    const doc = new jsPDF();
    const tableColumn = Object.keys(data[0]);
    const tableRows: any[][] = [];
    
    data.forEach(item => {
      const rowData = tableColumn.map(columnKey => {
        const value = item[columnKey];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      });
      tableRows.push(rowData);
    });
    
    const dateRangeText = dateRange.from && dateRange.to 
      ? `Data from ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`
      : 'Data export';
      
    doc.setFontSize(14);
    doc.text('AccZen Report', 14, 15);
    
    doc.setFontSize(10);
    doc.text(dateRangeText, 14, 21);
    doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 27);
    
    autoTable(doc, {
      head: [tableColumn.map(header => header.replace('_', ' ').toUpperCase())],
      body: tableRows,
      startY: 35,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 'auto' }
      },
      headStyles: {
        fillColor: [46, 204, 113]
      }
    });
    
    doc.save(`${fileName}.pdf`);
  };
  
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!data || data.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportToPDF} disabled={!data || data.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
}
