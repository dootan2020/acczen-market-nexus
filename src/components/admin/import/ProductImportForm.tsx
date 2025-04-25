
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  loading?: boolean;
  error?: string | null;
}

export const ProductImportForm: React.FC<ProductImportFormProps> = ({
  userToken,
  kioskToken,
  onUserTokenChange,
  onKioskTokenChange,
  onSubmit,
  loading = false,
  error = null
}) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || !form.watch('userToken') || !form.watch('kioskToken')}
          className="w-full md:w-auto"
        >
          {loading ? "Fetching..." : "Fetch Products"}
        </Button>
      </form>
    </Form>
  );
};
