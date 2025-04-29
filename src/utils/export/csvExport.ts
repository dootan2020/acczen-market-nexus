
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export interface ExportOptions {
  fileName: string;
  filePrefix?: string;
  dateFormat?: string;
}

const defaultOptions: ExportOptions = {
  fileName: 'report',
  filePrefix: 'digitaldealshub_',
  dateFormat: 'yyyy-MM-dd_HH-mm'
};

/**
 * Formats the date for inclusion in file name
 */
const formatDateForFileName = (date: Date = new Date(), format: string = 'yyyy-MM-dd_HH-mm'): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

/**
 * Export data to CSV file
 */
export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  options: Partial<ExportOptions> = {}
): void => {
  const { fileName, filePrefix, dateFormat } = { ...defaultOptions, ...options };
  
  const timestamp = formatDateForFileName(new Date(), dateFormat);
  const fullFileName = `${filePrefix}${fileName}_${timestamp}.csv`;
  
  // Convert data to CSV
  const csv = Papa.unparse(data, {
    header: true,
    skipEmptyLines: true
  });
  
  // Create a blob and save it
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, fullFileName);
};

/**
 * Format deposit data for export
 */
export const formatDepositsForExport = (deposits: any[]) => {
  return deposits.map(deposit => ({
    'ID': deposit.id,
    'Date': new Date(deposit.created_at).toLocaleString(),
    'User ID': deposit.user_id,
    'Amount': deposit.amount,
    'Status': deposit.status,
    'Payment Method': deposit.payment_method,
    'Transaction ID': deposit.transaction_hash || deposit.paypal_order_id || deposit.payment_id
  }));
};

/**
 * Format order data for export
 */
export const formatOrdersForExport = (orders: any[]) => {
  return orders.map(order => ({
    'ID': order.id,
    'Date': new Date(order.created_at).toLocaleString(),
    'User ID': order.user_id,
    'Total Amount': order.total_amount,
    'Status': order.status,
    'Items Count': order.items_count || 0
  }));
};

/**
 * Format products data for export
 */
export const formatProductsForExport = (products: any[]) => {
  return products.map(product => ({
    'Name': product.name,
    'Category': product.category_name || 'Uncategorized',
    'Units Sold': product.orders,
    'Revenue': product.revenue.toFixed(2),
    'Average Price': (product.revenue / product.orders).toFixed(2)
  }));
};
