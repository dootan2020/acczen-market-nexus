
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from 'qrcode.react';
import { Loader, AlertCircle, CheckCircle, Copy, Clock, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface USDTDepositProps {
  onSubmit?: () => void;
}

const USDTDeposit = ({ onSubmit }: USDTDepositProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('deposit');
  
  // This would come from your admin configuration
  const walletAddress = "TRC20WalletAddressHere"; // Replace with actual wallet address

  // Status for real-time verification process
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [verificationProgress, setVerificationProgress] = useState<number>(0);

  const depositMutation = useMutation({
    mutationFn: async (txid: string) => {
      if (!user) throw new Error('User not authenticated');

      // First, create a pending deposit record
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          payment_method: 'USDT',
          transaction_hash: txid,
          status: 'pending'
        })
        .select()
        .single();

      if (depositError) throw depositError;

      // Start verification process
      setIsVerifying(true);
      setVerificationStatus('searching');
      setVerificationProgress(10);
      
      try {
        // Simulate network search delay (real verification happens server-side)
        await new Promise(r => setTimeout(r, 1500));
        setVerificationStatus('found');
        setVerificationProgress(30);
        
        await new Promise(r => setTimeout(r, 1000));
        setVerificationStatus('verifying');
        setVerificationProgress(60);
        
        // Call the edge function to verify the transaction
        const verifyResponse = await supabase.functions.invoke('verify-usdt-transaction', {
          body: JSON.stringify({
            txid,
            expected_amount: parseFloat(amount),
            user_id: user.id,
            deposit_id: depositData.id,
            wallet_address: walletAddress
          })
        });

        if (!verifyResponse.data.success) {
          setVerificationStatus('failed');
          setVerificationProgress(100);
          throw new Error(verifyResponse.data.message || 'Transaction verification failed');
        }
        
        setVerificationStatus('success');
        setVerificationProgress(100);
        
        return verifyResponse.data;
      } catch (error) {
        setVerificationStatus('failed');
        setVerificationProgress(100);
        throw error;
      } finally {
        setIsVerifying(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Deposit Successful',
        description: 'Your USDT deposit has been verified and added to your balance',
        variant: 'default'
      });
      onSubmit?.();
      setAmount('');
      setTxid('');
      // Navigate to success page
      navigate('/deposit/success', { 
        state: { 
          deposit: data.data.deposit,
          transaction: data.data.transaction
        } 
      });
    },
    onError: (error) => {
      toast({
        title: 'Deposit Verification Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
      
      // Allow retrying if verification failed
      if (verificationAttempts < 2) {
        setVerificationAttempts(prev => prev + 1);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txid) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }
    depositMutation.mutate(txid);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to Copy',
        description: 'Could not copy address to clipboard',
        variant: 'destructive'
      });
    }
  };

  const getTransactionExplorerUrl = (hash: string) => {
    return `https://tronscan.org/#/transaction/${hash}`;
  };

  // Render verification status UI
  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'searching':
        return (
          <div className="flex items-center space-x-2 text-amber-500 mt-2">
            <Clock className="animate-pulse h-4 w-4" />
            <span>Searching for transaction on blockchain...</span>
          </div>
        );
      case 'found':
        return (
          <div className="flex items-center space-x-2 text-amber-500 mt-2">
            <Clock className="animate-pulse h-4 w-4" />
            <span>Transaction found, verifying details...</span>
          </div>
        );
      case 'verifying':
        return (
          <div className="flex items-center space-x-2 text-blue-500 mt-2">
            <Loader className="animate-spin h-4 w-4" />
            <span>Verifying transaction amount and recipient...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-green-500 mt-2">
            <CheckCircle className="h-4 w-4" />
            <span>Transaction verified successfully!</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-2 text-red-500 mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>Verification failed. Please check transaction details.</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Progress indicator for verification
  const VerificationProgress = () => {
    if (!verificationStatus || verificationStatus === '') return null;
    
    return (
      <div className="mt-4 mb-2">
        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
          <span>Verification Progress</span>
          <span>{verificationProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              verificationStatus === 'failed' 
                ? 'bg-red-500' 
                : verificationStatus === 'success'
                  ? 'bg-green-500'
                  : 'bg-amber-500'
            }`} 
            style={{ width: `${verificationProgress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="deposit">Deposit USDT</TabsTrigger>
        <TabsTrigger value="help">Help & FAQ</TabsTrigger>
      </TabsList>
      
      <TabsContent value="deposit">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Deposit USDT (TRC20)</CardTitle>
            <CardDescription>
              Send USDT on the Tron network (TRC20) to add funds to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Important</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Only send USDT using the TRC20 network. Other networks are not supported and may result in lost funds.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Send USDT to this address:</p>
                <div className="bg-muted p-4 rounded-lg break-all relative">
                  <Badge className="absolute top-2 right-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" variant="outline">
                    TRC20
                  </Badge>
                  {walletAddress}
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 bottom-1"
                    onClick={() => copyToClipboard(walletAddress)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-6 mb-4 flex justify-center">
                  <div className="border border-muted-foreground/20 p-3 rounded-lg">
                    <QRCodeSVG value={walletAddress} size={180} />
                  </div>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" /> 
                  <span>Estimated confirmation time: 1-5 minutes</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Amount in USDT</label>
                  <Input
                    type="number"
                    placeholder="Enter deposit amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum deposit: 1.00 USDT
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center">
                    Transaction ID (TXID)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>After sending USDT from your wallet, copy the transaction ID (TXID) from your wallet or exchange.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter transaction ID"
                    value={txid}
                    onChange={(e) => setTxid(e.target.value)}
                    className="font-mono text-sm bg-white"
                  />
                </div>

                {txid && verificationStatus && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    {renderVerificationStatus()}
                    <VerificationProgress />
                    {verificationStatus === 'found' || verificationStatus === 'verifying' || verificationStatus === 'success' ? (
                      <div className="text-xs text-right mt-1">
                        <a 
                          href={getTransactionExplorerUrl(txid)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Tronscan →
                        </a>
                      </div>
                    ) : null}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={depositMutation.isPending || isVerifying}
                >
                  {depositMutation.isPending || isVerifying ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {isVerifying ? 'Verifying Transaction...' : 'Submitting...'}
                    </>
                  ) : (
                    'Verify & Submit Deposit'
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground border-t pt-4">
            <p>Having trouble? Contact our support team for assistance.</p>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="help">
        <Card>
          <CardHeader>
            <CardTitle>USDT Deposit FAQ</CardTitle>
            <CardDescription>
              Frequently asked questions about USDT deposits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is TRC20 USDT?</AccordionTrigger>
                <AccordionContent>
                  TRC20 USDT is Tether (USDT) that runs on the TRON blockchain network. It offers faster transaction times and lower fees compared to other networks like ERC20 (Ethereum).
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How long do deposits take?</AccordionTrigger>
                <AccordionContent>
                  TRC20 USDT deposits typically take 1-5 minutes to be confirmed on the blockchain. Once confirmed, our system will automatically verify and credit your account.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Are there any fees?</AccordionTrigger>
                <AccordionContent>
                  We don't charge any fees for USDT deposits. However, your wallet or exchange may charge a small network fee for sending USDT on the TRON network.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I find my transaction ID (TXID)?</AccordionTrigger>
                <AccordionContent>
                  After sending USDT from your wallet or exchange, you'll receive a transaction ID (TXID). This can usually be found in your transaction history or withdrawal confirmation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Why was my transaction not found?</AccordionTrigger>
                <AccordionContent>
                  <p>There are several possible reasons:</p>
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    <li>The transaction is still pending on the blockchain</li>
                    <li>You entered the TXID incorrectly</li>
                    <li>You sent USDT on a different network (not TRC20)</li>
                    <li>You sent to a different wallet address</li>
                  </ul>
                  <p className="mt-2">Please verify your transaction details and try again.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>I sent the wrong amount. What should I do?</AccordionTrigger>
                <AccordionContent>
                  If you sent a different amount than what you specified in the form, our system will still try to verify the transaction. If the verification fails, please contact our support team with your transaction details, and they will assist you.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger>How do I check my deposit history?</AccordionTrigger>
                <AccordionContent>
                  You can view your deposit history in the Dashboard section under "Transaction History". This will show all your deposits, including their status and amounts.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex flex-col items-start border-t pt-6">
            <h3 className="text-base font-medium mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is available 24/7 to assist you with any deposit issues.
            </p>
            <Button variant="outline" onClick={() => window.open('mailto:support@digitaldealshub.com')}>
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default USDTDeposit;
