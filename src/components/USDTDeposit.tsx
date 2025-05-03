
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Clipboard, ClipboardCheck, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { USDTPresetAmounts } from './usdt/USDTPresetAmounts';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from "@/integrations/supabase/client";

// Define the validation schema
const depositSchema = z.object({
  amount: z
    .string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, { message: "Amount must be greater than 0" })
    .refine(val => {
      const num = parseFloat(val);
      return num <= 10000;
    }, { message: "Amount cannot exceed $10,000" })
    .refine(val => {
      const num = parseFloat(val);
      return Number.isInteger(Math.round(num * 100) / 100);
    }, { message: "Amount can have at most 2 decimal places" })
});

type DepositFormValues = z.infer<typeof depositSchema>;

// Wallet address for USDT deposits (TRC20 network)
const WALLET_ADDRESS = "TDWQuvuxa363Gz9y33RSKYiJq9sWBAbgDV";

const USDTDeposit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { formatUSD } = useCurrencyContext();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize form
  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
    },
    mode: "onChange"
  });

  const onPresetAmountSelect = (value: string) => {
    form.setValue("amount", value, { shouldValidate: true });
  };

  const onSubmit = async (values: DepositFormValues) => {
    if (!user) {
      toast.error("You must be logged in to make a deposit");
      return;
    }

    const amount = parseFloat(values.amount);
    setIsSubmitting(true);

    try {
      // Create a deposit record in the database
      const { data: deposit, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: amount,
          payment_method: 'USDT',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Show QR code and wallet address
      setShowQR(true);
      setDepositId(deposit.id);
      toast.success("Deposit initiated", { description: "Please send USDT to the provided address" });
    } catch (error) {
      console.error('Error creating deposit:', error);
      toast.error("Failed to initiate deposit", { description: "Please try again later" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    toast.success("Wallet address copied to clipboard");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleVerifyPayment = async () => {
    if (!depositId || !txHash.trim() || !user) {
      toast.error("Missing transaction details");
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = parseFloat(form.getValues("amount"));

      // Update the deposit record with transaction hash
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ transaction_hash: txHash })
        .eq('id', depositId);

      if (updateError) throw updateError;

      // Call the edge function to verify the transaction
      const { data, error } = await supabase.functions.invoke('verify-usdt-transaction', {
        body: {
          txid: txHash,
          expected_amount: amount,
          user_id: user.id,
          deposit_id: depositId,
          wallet_address: WALLET_ADDRESS
        }
      });

      if (error) throw error;

      if (data.success) {
        navigate('/deposit/success', { 
          state: { 
            deposit: data.data.deposit,
            transaction: data.data.transaction
          }
        });
      } else {
        // If verification is started but not complete yet
        navigate('/deposit/pending', { 
          state: { depositId }
        });
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error("Verification failed", { description: error.message || "Please check your transaction hash and try again" });
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setShowQR(false);
    setDepositId(null);
    setTxHash("");
    form.reset();
  };

  const formIsValid = form.formState.isValid;

  return (
    <Card className="w-full border-border/40 shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">
          USDT Deposit (TRC20)
        </CardTitle>
        <CardDescription>
          Send USDT (Tether) on the Tron network
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!showQR ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Alert className="bg-amber-50/50 border-amber-200">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-700">Important Information</AlertTitle>
                <AlertDescription className="text-amber-600">
                  Only send USDT on the TRC20 (Tron) network. Sending assets on other networks
                  will result in loss of funds.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="amount" className="font-medium">
                      Deposit Amount (USDT)
                    </Label>
                    <FormControl>
                      <Input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="Enter amount..."
                        value={field.value}
                        onChange={field.onChange}
                        className="bg-white mt-1.5"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <USDTPresetAmounts
                selectedAmount={form.getValues("amount")}
                onAmountSelect={onPresetAmountSelect}
                disabled={isSubmitting}
              />

              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={!formIsValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Send exactly {formatUSD(parseFloat(form.getValues("amount")))} USDT</AlertTitle>
              <AlertDescription>
                Send USDT to the address below and verify your transaction by providing the TxID/Hash.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeSVG 
                  value={`tron:${WALLET_ADDRESS}?amount=${form.getValues("amount")}`}
                  size={200}
                  level="M"
                />
              </div>
              
              <div className="w-full">
                <Label htmlFor="wallet-address" className="text-sm font-medium">
                  USDT TRC20 Wallet Address
                </Label>
                <div className="flex mt-1">
                  <Input 
                    id="wallet-address" 
                    value={WALLET_ADDRESS} 
                    readOnly 
                    className="font-mono text-sm bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <ClipboardCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clipboard className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="tx-hash" className="text-sm font-medium">
                  Transaction Hash/TxID
                </Label>
                <Input
                  id="tx-hash"
                  placeholder="Enter transaction hash..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div className="flex gap-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={handleStartOver}
                  disabled={isSubmitting}
                >
                  Start Over
                </Button>
                <Button
                  type="button"
                  className="w-1/2"
                  onClick={handleVerifyPayment}
                  disabled={!txHash.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default USDTDeposit;
