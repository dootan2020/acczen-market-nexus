
import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import { ProductFormData } from '@/types/products';
import { generateSlug, generateSKU } from '@/utils/product-utils';

interface ImportOptions {
  headerRowIndex?: number;
  sheetIndex?: number;
}

export const useProductImportExport = () => {
  const [importedData, setImportedData] = useState<ProductFormData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleImportCSV = async (file: File, options?: ImportOptions) => {
    setIsImporting(true);
    setImportErrors([]);
    
    return new Promise<ProductFormData[]>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const errors: string[] = [];
            const parsedProducts = results.data.map((row: any, index: number) => {
              // Map CSV columns to product data
              const product: Partial<ProductFormData> = {
                name: row.Name || row.name || '',
                description: row.Description || row.description || '',
                price: row.Price || row.price || '0',
                sale_price: row['Sale Price'] || row.sale_price || '',
                stock_quantity: row['Stock Quantity'] || row.stock_quantity || '0',
                image_url: row['Image URL'] || row.image_url || '',
                status: row.Status || row.status || 'draft',
                category_id: row.category_id || '',
                subcategory_id: row.subcategory_id || '',
                sku: row.SKU || row.sku || generateSKU(),
              };
              
              // Add slug if not provided
              product.slug = row.Slug || row.slug || generateSlug(product.name as string);
              
              // Validate required fields
              if (!product.name) {
                errors.push(`Row ${index + 2}: Missing product name`);
              }
              
              return product as ProductFormData;
            });
            
            if (errors.length > 0) {
              setImportErrors(errors);
              toast({
                title: "Import validation errors",
                description: `${errors.length} errors found in the import file`,
                variant: "destructive"
              });
            }
            
            setImportedData(parsedProducts);
            setIsImporting(false);
            resolve(parsedProducts);
          } catch (error) {
            console.error("CSV import error:", error);
            setIsImporting(false);
            toast({
              title: "Import failed",
              description: error instanceof Error ? error.message : "Failed to import CSV file",
              variant: "destructive"
            });
            reject(error);
          }
        },
        error: (error) => {
          console.error("CSV parse error:", error);
          setIsImporting(false);
          toast({
            title: "Import failed",
            description: error.message,
            variant: "destructive"
          });
          reject(error);
        }
      });
    });
  };
  
  const handleImportExcel = async (file: File, options?: ImportOptions) => {
    setIsImporting(true);
    setImportErrors([]);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const sheetIndex = options?.sheetIndex || 0;
      const sheetName = workbook.SheetNames[sheetIndex];
      
      if (!sheetName) {
        throw new Error(`Sheet at index ${sheetIndex} not found`);
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      
      const errors: string[] = [];
      const parsedProducts = jsonData.map((row: any, index: number) => {
        // Map Excel columns to product data
        const product: Partial<ProductFormData> = {
          name: row.Name || row.name || '',
          description: row.Description || row.description || '',
          price: row.Price || row.price || '0',
          sale_price: row['Sale Price'] || row.sale_price || '',
          stock_quantity: row['Stock Quantity'] || row.stock_quantity || '0',
          image_url: row['Image URL'] || row.image_url || '',
          status: row.Status || row.status || 'draft',
          category_id: row.category_id || '',
          subcategory_id: row.subcategory_id || '',
          sku: row.SKU || row.sku || generateSKU(),
        };
        
        // Add slug if not provided
        product.slug = row.Slug || row.slug || generateSlug(product.name as string);
        
        // Validate required fields
        if (!product.name) {
          errors.push(`Row ${index + 2}: Missing product name`);
        }
        
        return product as ProductFormData;
      });
      
      if (errors.length > 0) {
        setImportErrors(errors);
        toast({
          title: "Import validation errors",
          description: `${errors.length} errors found in the import file`,
          variant: "destructive"
        });
      }
      
      setImportedData(parsedProducts);
      setIsImporting(false);
      return parsedProducts;
    } catch (error) {
      console.error("Excel import error:", error);
      setIsImporting(false);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import Excel file",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return {
    importedData,
    setImportedData,
    isImporting,
    importErrors,
    handleImportCSV,
    handleImportExcel
  };
};
