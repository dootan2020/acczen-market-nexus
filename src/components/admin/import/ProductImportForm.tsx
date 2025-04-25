
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PROXY_OPTIONS, ProxyType, getStoredProxy, setStoredProxy, getStoredTokens, setStoredTokens } from '@/utils/corsProxy';

interface ApiCredentials {
  userToken: string;
  kioskToken: string;
  proxyType: ProxyType;
  rememberProxy: boolean;
  rememberTokens: boolean;
}

interface ProductImportFormProps {
  userToken: string;
  kioskToken: string;
  onUserTokenChange: (token: string) => void;
  onKioskTokenChange: (token: string) => void;
  onSubmit: (proxyType: ProxyType) => void;
  onTestConnection?: (proxyType: ProxyType) => Promise<{ success: boolean; message: string }>;
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
  
  const storedTokens = React.useMemo(() => getStoredTokens(), []);

  const form = useForm<ApiCredentials>({
    defaultValues: {
      userToken: userToken || storedTokens.userToken,
      kioskToken: kioskToken || storedTokens.kioskToken,
      proxyType: getStoredProxy(),
      rememberProxy: false,
      rememberTokens: false
    }
  });

  const handleSubmit = (data: ApiCredentials) => {
    onUserTokenChange(data.userToken);
    onKioskTokenChange(data.kioskToken);
    
    if (data.rememberProxy) {
      setStoredProxy(data.proxyType);
    }
    
    if (data.rememberTokens) {
      setStoredTokens(data.userToken, data.kioskToken);
    }
    
    onSubmit(data.proxyType);
  };
  
  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    
    const values = form.getValues();
    onUserTokenChange(values.userToken);
    onKioskTokenChange(values.kioskToken);
    
    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const result = await onTestConnection(values.proxyType);
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
          
          <FormField
            control={form.control}
            name="proxyType"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>CORS Proxy</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a proxy service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROXY_OPTIONS.map((proxy) => (
                      <SelectItem key={proxy.value} value={proxy.value}>
                        {proxy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {PROXY_OPTIONS.find(p => p.value === field.value)?.description || 'Select a proxy service to handle CORS issues'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="rememberProxy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-start space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel>Remember this proxy</FormLabel>
                    <FormDescription>
                      Save your proxy preference for future sessions
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rememberTokens"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-start space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel>Remember my tokens</FormLabel>
                    <FormDescription>
                      Save your API tokens for future use (stored locally)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
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
            <li>Select a CORS proxy server to handle cross-origin requests</li>
            <li>You can test the connection before fetching products</li>
            <li>If one proxy doesn't work, try another from the dropdown</li>
          </ul>
        </div>
      </form>
    </Form>
  );
};
