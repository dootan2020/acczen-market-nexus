
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const paymentSchema = z.object({
  paypalEnabled: z.boolean().default(true),
  paypalClientId: z.string().min(1, "Client ID is required"),
  paypalClientSecret: z.string().min(1, "Client Secret is required"),
  paypalMode: z.string(),
  cryptoEnabled: z.boolean().default(true),
  tronWalletAddress: z.string().min(1, "Wallet address is required"),
  transactionFee: z.number().min(0).max(100),
  minDepositAmount: z.number().min(1),
  maxDepositAmount: z.number().min(1),
  allowAutomaticRefunds: z.boolean().default(true),
  refundPeriodDays: z.number().min(1).max(90),
});

export const PaymentSettings = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paypalEnabled: true,
      paypalClientId: "••••••••••••••••••••••••••••••••••••••",
      paypalClientSecret: "••••••••••••••••••••••••••••••••••••••",
      paypalMode: "sandbox",
      cryptoEnabled: true,
      tronWalletAddress: "T•••••••••••••••••••••••••••••••••••••••••••",
      transactionFee: 2.9,
      minDepositAmount: 10,
      maxDepositAmount: 1000,
      allowAutomaticRefunds: true,
      refundPeriodDays: 30,
    },
  });

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    console.log(values);
    toast({
      title: "Payment Settings Saved",
      description: "Your payment configurations have been updated successfully!",
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <p className="text-muted-foreground">Configure payment gateways and transaction settings</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Payment Gateways</CardTitle>
                <CardDescription>Configure your payment provider integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="paypal" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="paypal" className="data-[state=active]:bg-chatgpt-primary data-[state=active]:text-white">PayPal</TabsTrigger>
                    <TabsTrigger value="crypto" className="data-[state=active]:bg-chatgpt-primary data-[state=active]:text-white">Cryptocurrency</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="paypal" className="space-y-6 pt-4">
                    <FormField
                      control={form.control}
                      name="paypalEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable PayPal</FormLabel>
                            <FormDescription>
                              Allow users to deposit funds and pay with PayPal
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paypalClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PayPal Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your PayPal application client ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paypalClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PayPal Client Secret</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your PayPal application client secret
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paypalMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PayPal Mode</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                              <SelectItem value="live">Live (Production)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select sandbox for testing or live for production
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "PayPal Connection Test",
                          description: "Successfully connected to PayPal API.",
                        });
                      }}
                    >
                      Test PayPal Connection
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="crypto" className="space-y-6 pt-4">
                    <FormField
                      control={form.control}
                      name="cryptoEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Cryptocurrency</FormLabel>
                            <FormDescription>
                              Allow users to deposit funds using USDT (TRC20)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tronWalletAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TRON Wallet Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your TRON wallet address to receive USDT payments
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Settings</CardTitle>
                  <CardDescription>Configure fees and transaction limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="transactionFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Fee (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Fee applied to deposits (percentage)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minDepositAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Deposit ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxDepositAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Deposit ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Refund Policy</CardTitle>
                  <CardDescription>Configure automatic refund settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allowAutomaticRefunds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Automatic Refunds</FormLabel>
                          <FormDescription>
                            Automatically process eligible refund requests
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="refundPeriodDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Period (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of days after purchase for refund eligibility
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Button type="submit" className="bg-chatgpt-primary hover:bg-chatgpt-primary/90">Save Payment Settings</Button>
        </form>
      </Form>
    </div>
  );
};
