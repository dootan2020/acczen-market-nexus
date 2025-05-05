
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { File, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface ImportDropzoneProps {
  onImportCSV: (file: File) => Promise<any>;
  onImportExcel: (file: File) => Promise<any>;
  isLoading?: boolean;
}

export const ImportDropzone = ({ 
  onImportCSV, 
  onImportExcel, 
  isLoading = false 
}: ImportDropzoneProps) => {
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    // Simulate progress
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      if (fileType === 'csv') {
        await onImportCSV(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        await onImportExcel(file);
      } else {
        toast({
          title: "Unsupported file format",
          description: "Please upload a CSV or Excel file",
          variant: "destructive"
        });
      }
      
      // Complete progress
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      clearInterval(interval);
      setProgress(0);
      console.error("Import error:", error);
    }
  }, [onImportCSV, onImportExcel, toast]);
  
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isLoading
  });
  
  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'} 
          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {acceptedFiles.length > 0 ? (
            <>
              <FileSpreadsheet className="h-10 w-10 text-primary" />
              <div className="text-sm">
                <p className="font-medium">{acceptedFiles[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  {(acceptedFiles[0].size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? "Drop the file here..." 
                    : "Drag and drop a file, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Support for CSV and Excel files
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {progress > 0 && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {progress === 100 ? "Import complete" : "Processing file..."}
          </p>
        </div>
      )}
      
      {acceptedFiles.length > 0 && progress === 0 && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={() => {
              acceptedFiles[0].name.endsWith('.csv') 
                ? onImportCSV(acceptedFiles[0])
                : onImportExcel(acceptedFiles[0]);
            }}
            disabled={isLoading}
          >
            <File className="mr-2 h-4 w-4" />
            Process File
          </Button>
        </div>
      )}
    </div>
  );
};
