
import { ProductFormData } from '@/types/products';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Generate SKU code
export const generateSKU = () => {
  const prefix = 'PROD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Validate product data
export const validateProductData = (data: ProductFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.name) errors.name = 'Product name is required';
  if (!data.description) errors.description = 'Description is required';
  if (!data.price) errors.price = 'Price is required';
  else if (isNaN(Number(data.price)) || Number(data.price) <= 0) 
    errors.price = 'Price must be a positive number';
  
  if (data.sale_price && (isNaN(Number(data.sale_price)) || Number(data.sale_price) <= 0))
    errors.sale_price = 'Sale price must be a positive number';
  
  if (Number(data.sale_price) >= Number(data.price))
    errors.sale_price = 'Sale price must be less than regular price';
    
  if (!data.category_id) errors.category_id = 'Category is required';
  if (!data.slug) errors.slug = 'Slug is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generate slug from product name
export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Export products to CSV
export const exportProductsToCSV = (products: any[]) => {
  if (!products || products.length === 0) return null;
  
  const formattedProducts = products.map(product => ({
    Name: product.name,
    Description: product.description,
    Price: product.price,
    'Sale Price': product.sale_price || '',
    'Stock Quantity': product.stock_quantity,
    SKU: product.sku,
    Slug: product.slug,
    Category: product.category?.name || '',
    Subcategory: product.subcategory?.name || '',
    Status: product.status,
    'Image URL': product.image_url || ''
  }));
  
  const csv = Papa.unparse(formattedProducts);
  
  // Create a blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export products to Excel
export const exportProductsToExcel = (products: any[]) => {
  if (!products || products.length === 0) return null;
  
  const formattedProducts = products.map(product => ({
    Name: product.name,
    Description: product.description,
    Price: product.price,
    'Sale Price': product.sale_price || '',
    'Stock Quantity': product.stock_quantity,
    SKU: product.sku,
    Slug: product.slug,
    Category: product.category?.name || '',
    Subcategory: product.subcategory?.name || '',
    Status: product.status,
    'Image URL': product.image_url || ''
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(formattedProducts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  // Generate file and download
  XLSX.writeFile(workbook, `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
