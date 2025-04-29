
/**
 * Export data to CSV file
 * @param data Array of objects to export
 * @param filename Filename without extension
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // Get headers from the first item
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape double quotes and wrap values with commas in quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Combine rows into a single CSV string
  const csvString = csvRows.join('\n');
  
  // Create a download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export orders to CSV file with formatting
 * @param orders Array of order objects to export
 * @param filename Filename without extension
 */
export const exportOrdersToCsv = (orders: any[], filename: string) => {
  if (!orders || orders.length === 0) {
    console.error('No orders to export');
    return;
  }
  
  // Format orders for CSV export
  const formattedOrders = orders.map(order => {
    // Format date
    const orderDate = new Date(order.created_at).toLocaleDateString();
    
    // Format items if available
    let itemsText = '';
    if (order.items && Array.isArray(order.items)) {
      itemsText = order.items.map((item: any) => 
        `${item.name} (${item.quantity})`).join('; ');
    }
    
    // Return formatted order
    return {
      'Order ID': order.id,
      'Date': orderDate,
      'Customer': order.user?.username || order.user?.email || 'Unknown',
      'Items': itemsText,
      'Total': order.total_amount ? `$${order.total_amount.toFixed(2)}` : '$0.00',
      'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1)
    };
  });
  
  // Export the formatted orders
  exportToCsv(formattedOrders, filename);
};
