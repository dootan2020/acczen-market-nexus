
import { useState } from 'react';
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
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductImportFormProps {
  onFetchProduct: (kioskToken: string, userToken: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function ProductImportForm({ onFetchProduct, isLoading, error }: ProductImportFormProps) {
  const [kioskToken, setKioskToken] = useState('');
  const [userToken, setUserToken] = useState('0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchProduct(kioskToken, userToken);
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
            />
            <p className="text-xs text-muted-foreground">
              The unique token for the product you want to import
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading || !kioskToken || !userToken}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
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
