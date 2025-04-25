
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductImportFormProps {
  onFetchProduct: (kioskToken: string, userToken: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  retry?: number;
  maxRetries?: number;
}

export default function ProductImportForm({ 
  onFetchProduct, 
  isLoading, 
  error,
  retry = 0,
  maxRetries = 0
}: ProductImportFormProps) {
  // Default API token for TaphoaMMO
  const DEFAULT_USER_TOKEN = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9';
  
  const [kioskToken, setKioskToken] = useState('');
  const [userToken, setUserToken] = useState(DEFAULT_USER_TOKEN);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  useEffect(() => {
    // Clear validation error when external error changes
    if (error) {
      setValidationError(null);
    }
  }, [error]);
  
  const validateForm = () => {
    if (!kioskToken.trim()) {
      setValidationError('Kiosk Token is required');
      return false;
    }
    
    if (!userToken.trim()) {
      setValidationError('User Token is required');
      return false;
    }
    
    setValidationError(null);
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onFetchProduct(kioskToken, userToken);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Product from TaphoaMMO</CardTitle>
        <CardDescription>
          Enter the product token information to fetch product details
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-token">User Token</Label>
            <Input
              id="user-token"
              placeholder="User Token"
              value={userToken}
              onChange={(e) => setUserToken(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This is your account token for TaphoaMMO API access
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="kiosk-token">Kiosk Token</Label>
            <Input
              id="kiosk-token"
              placeholder="Enter product kiosk token"
              value={kioskToken}
              onChange={(e) => setKioskToken(e.target.value)}
              required
              disabled={isLoading}
              className={validationError && !kioskToken ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              The unique token for the product you want to import
            </p>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">API Error:</div>
                <div>{error}</div>
                {retry > 0 && (
                  <div className="mt-2 text-sm">
                    Retry attempt: {retry}/{maxRetries}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || (!kioskToken && !validationError)} 
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {retry > 0 ? "Retrying..." : "Fetching..."}
              </>
            ) : retry > 0 ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </>
            ) : (
              'Fetch Product Info'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
