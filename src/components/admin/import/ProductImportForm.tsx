
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductImportFormProps {
  userToken: string;
  kioskToken: string;
  onUserTokenChange: (token: string) => void;
  onKioskTokenChange: (token: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const ProductImportForm: React.FC<ProductImportFormProps> = ({
  userToken,
  kioskToken,
  onUserTokenChange,
  onKioskTokenChange,
  onSubmit,
  loading = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="userToken" className="text-sm font-medium">
            User Token
          </label>
          <Input
            id="userToken"
            value={userToken}
            onChange={(e) => onUserTokenChange(e.target.value)}
            placeholder="Your TaphoaMMO user token"
            required
          />
          <p className="text-xs text-muted-foreground">
            Found in your TaphoaMMO account settings
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="kioskToken" className="text-sm font-medium">
            Kiosk Token (Product Token)
          </label>
          <Input
            id="kioskToken"
            value={kioskToken}
            onChange={(e) => onKioskTokenChange(e.target.value)}
            placeholder="Product kiosk token"
            required
          />
          <p className="text-xs text-muted-foreground">
            Found in the product API tab on TaphoaMMO
          </p>
        </div>
      </div>
      
      <Button type="submit" disabled={loading || !userToken || !kioskToken}>
        {loading ? "Fetching..." : "Fetch Products"}
      </Button>
    </form>
  );
};
