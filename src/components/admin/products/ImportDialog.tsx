
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportDropzone } from './ImportDropzone';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Circle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProductFormData } from '@/types/products';

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  importedProducts: ProductFormData[];
  importErrors: string[];
  onImportCSV: (file: File) => Promise<any>;
  onImportExcel: (file: File) => Promise<any>;
  onImportConfirm: (products: ProductFormData[]) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
}

export function ImportDialog({
  isOpen,
  onOpenChange,
  importedProducts,
  importErrors,
  onImportCSV,
  onImportExcel,
  onImportConfirm,
  isLoading,
  isPending
}: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState('upload');
  
  const handleImport = async () => {
    try {
      await onImportConfirm(importedProducts);
      setActiveTab('upload');
    } catch (error) {
      console.error('Error confirming import:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import products in bulk.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger 
              value="preview" 
              disabled={importedProducts.length === 0}
            >
              Preview Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="py-4">
              <ImportDropzone
                onImportCSV={onImportCSV}
                onImportExcel={onImportExcel}
                isLoading={isLoading}
              />
            </div>
            
            {importErrors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm">
                    {importErrors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importErrors.length > 5 && (
                      <li>...and {importErrors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {importedProducts.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm">
                  {importedProducts.length} products ready to import
                </p>
                <Button 
                  onClick={() => setActiveTab('preview')}
                  className="mt-2"
                >
                  Preview Data
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedProducts.slice(0, 100).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge>{product.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {importedProducts.length > 100 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing 100 of {importedProducts.length} products
              </p>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          
          {activeTab === 'preview' && (
            <Button
              onClick={handleImport}
              disabled={importedProducts.length === 0 || isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              {isPending ? 'Importing...' : `Import ${importedProducts.length} Products`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
