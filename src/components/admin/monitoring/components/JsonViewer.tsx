
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JsonViewerProps {
  data: any;
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [expanded, setExpanded] = React.useState(false);
  
  // Format the JSON with proper indentation for display
  const formattedJson = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }, [data]);
  
  return (
    <div className="relative font-mono text-xs">
      <div className="flex items-center mb-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 p-1 text-xs" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      
      {expanded ? (
        <pre className="bg-muted p-2 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre">
          {formattedJson}
        </pre>
      ) : (
        <div className="bg-muted p-2 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
          {typeof data === 'object' ? `${Object.keys(data).length} keys` : String(data).slice(0, 50)}
          {typeof data === 'object' && Object.keys(data).length > 0 && '...'}
        </div>
      )}
    </div>
  );
}
