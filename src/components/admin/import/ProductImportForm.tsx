
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiCredentials {
  userToken: string;
  kioskToken: string;
}

interface ProductImportFormProps {
  userToken: string;
  kioskToken: string;
  onUserTokenChange: (token: string) => void;
  onKioskTokenChange: (token: string) => void;
  onSubmit: () => void;
  onTestConnection?: () => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
  error?: string | null;
}

export const ProductImportForm: React.FC<ProductImportFormProps> = ({
  userToken,
  kioskToken,
  onUserTokenChange,
  onKioskTokenChange,
  onSubmit,
  onTestConnection,
  loading = false,
  error = null
}) => {
  const [connectionStatus, setConnectionStatus] = React.useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  
  const [testingConnection, setTestingConnection] = React.useState(false);

  const form = useForm<ApiCredentials>({
    defaultValues: {
      userToken,
      kioskToken
    }
  });

  const handleSubmit = (data: ApiCredentials) => {
    onUserTokenChange(data.userToken);
    onKioskTokenChange(data.kioskToken);
    onSubmit();
  };
  
  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    
    const values = form.getValues();
    onUserTokenChange(values.userToken);
    onKioskTokenChange(values.kioskToken);
    
    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const result = await onTestConnection();
      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.message
      });
    } catch (error) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {connectionStatus && (
          <Alert variant={connectionStatus.success ? "default" : "destructive"}>
            {connectionStatus.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{connectionStatus.success ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
            <AlertDescription>{connectionStatus.message}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="userToken"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="userToken">User Token</FormLabel>
                <FormControl>
                  <Input
                    id="userToken"
                    placeholder="Your TaphoaMMO user token"
                    {...field}
                    required
                  />
                </FormControl>
                <FormDescription className="flex items-center gap-1 text-xs">
                  <span>Found in your TaphoaMMO account settings</span>
                  <a 
                    href="https://taphoammo.net/account/settings"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="kioskToken"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="kioskToken">Kiosk Token (Product Token)</FormLabel>
                <FormControl>
                  <Input
                    id="kioskToken"
                    placeholder="Product kiosk token"
                    {...field}
                    required
                  />
                </FormControl>
                <FormDescription className="flex items-center gap-1 text-xs">
                  <span>Found in the product API tab on TaphoaMMO</span>
                  <a 
                    href="https://taphoammo.net/my-api"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          {onTestConnection && (
            <Button 
              type="button" 
              onClick={handleTestConnection}
              disabled={testingConnection || !form.watch('userToken') || !form.watch('kioskToken')}
              variant="outline"
            >
              {testingConnection ? "Testing Connection..." : "Test Connection"}
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={loading || !form.watch('userToken') || !form.watch('kioskToken')}
            className="w-full md:w-auto"
          >
            {loading ? "Fetching..." : "Fetch Products"}
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
          <h4 className="font-medium mb-1">API Instructions:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Enter both the User Token and Kiosk Token from your TaphoaMMO account</li>
            <li>The User Token is your account's API key found in Account Settings</li>
            <li>The Kiosk Token is specific to each product you want to import</li>
            <li>You can test the connection before fetching products</li>
            <li>If you encounter errors, verify your tokens and try again</li>
          </ul>
        </div>
      </form>
    </Form>
  );
};
