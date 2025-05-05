import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import { RefreshCw, Save } from 'lucide-react';

interface ExchangeRate {
  id: string;
  currency_code: string;
  rate: number;
  previous_rate: number;
  updated_at: string;
  updated_by: {
    email: string;
  };
}

const AdminExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockRates = [
        { id: '1', currency_code: 'USD', rate: 1, previous_rate: 1, updated_at: new Date().toISOString(), updated_by: { email: 'admin@example.com' } },
        { id: '2', currency_code: 'EUR', rate: 0.85, previous_rate: 0.84, updated_at: new Date().toISOString(), updated_by: { email: 'admin@example.com' } },
        { id: '3', currency_code: 'GBP', rate: 0.75, previous_rate: 0.76, updated_at: new Date().toISOString(), updated_by: { email: 'admin@example.com' } },
        { id: '4', currency_code: 'JPY', rate: 110.5, previous_rate: 111.2, updated_at: new Date().toISOString(), updated_by: { email: 'admin@example.com' } },
        { id: '5', currency_code: 'VND', rate: 23000, previous_rate: 23100, updated_at: new Date().toISOString(), updated_by: { email: 'admin@example.com' } },
      ];
      
      setRates(mockRates);
      toast({
        title: "Success",
        description: "Exchange rates loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exchange rates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (id: string, newRate: string) => {
    const numericRate = parseFloat(newRate);
    if (isNaN(numericRate)) return;
    
    setRates(rates.map(rate => 
      rate.id === id ? { ...rate, rate: numericRate } : rate
    ));
  };

  const saveRates = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update previous_rate and updated_at
      const updatedRates = rates.map(rate => ({
        ...rate,
        previous_rate: rate.rate,
        updated_at: new Date().toISOString(),
        updated_by: { email: user?.email || 'system@example.com' }
      }));
      
      setRates(updatedRates);
      toast({
        title: "Success",
        description: "Exchange rates updated successfully",
      });
      
      // Add to history
      const historyEntries = updatedRates.map(rate => ({
        id: `hist-${Date.now()}-${rate.id}`,
        currency_code: rate.currency_code,
        rate: rate.rate,
        previous_rate: rate.previous_rate,
        updated_at: rate.updated_at,
        updated_by: rate.updated_by,
      }));
      
      setHistory([...historyEntries, ...history]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exchange rates",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchHistory = async () => {
    if (history.length === 0) {
      // Mock history data
      const mockHistory = [];
      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        rates.forEach(rate => {
          mockHistory.push({
            id: `hist-${i}-${rate.id}`,
            currency_code: rate.currency_code,
            rate: rate.rate * (1 + (Math.random() * 0.1 - 0.05)),
            previous_rate: rate.rate,
            updated_at: date.toISOString(),
            updated_by: { email: 'admin@example.com' },
          });
        });
      }
      
      setHistory(mockHistory);
    }
    
    setShowHistory(true);
  };

  const processExchangeRateHistory = (data: any[]) => {
    return data.map((item: any) => ({
      id: item.id,
      currency_code: item.currency_code,
      rate: item.rate,
      previous_rate: item.previous_rate,
      updated_at: item.updated_at,
      updated_by: item.updated_by?.email || 'System',
    }));
  };

  // Modified rendering for the exchange rates table to fix formatCurrency calls
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Manage exchange rates for different currencies</h2>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowHistory(false);
              fetchRates();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rates
          </Button>
          
          <Button 
            variant="outline" 
            onClick={fetchHistory}
          >
            View History
          </Button>
          
          <Button 
            onClick={saveRates} 
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      
      {!showHistory ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Exchange Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Current Rate (to USD)</TableHead>
                  <TableHead>Previous Rate</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.currency_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rate.rate}
                          onChange={(e) => handleRateChange(rate.id, e.target.value)}
                          className="w-32"
                          step="0.01"
                        />
                        <span className="text-muted-foreground">
                          1 USD = {formatCurrency(rate.rate, rate.currency_code)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(rate.previous_rate, rate.currency_code)}</TableCell>
                    <TableCell>{new Date(rate.updated_at).toLocaleString()}</TableCell>
                    <TableCell>{rate.updated_by.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Exchange Rate History</CardTitle>
            <Button variant="outline" onClick={() => setShowHistory(false)}>
              Back to Current Rates
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Previous Rate</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processExchangeRateHistory(history).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.currency_code}</TableCell>
                    <TableCell>{formatCurrency(item.rate, item.currency_code)}</TableCell>
                    <TableCell>{formatCurrency(item.previous_rate, item.currency_code)}</TableCell>
                    <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                    <TableCell>{item.updated_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminExchangeRates;
