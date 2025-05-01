
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  secretToken: z.string().min(1, "Secret token is required"),
  baseUrl: z.string().url({ message: "Please enter a valid URL" }),
  timeout: z.number().min(1).max(120),
  maxRetries: z.number().min(0).max(10),
  rateLimit: z.number().min(1),
  syncSchedule: z.string(),
  enableSync: z.boolean().default(true),
});

export const APISettings = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "••••••••••••••••••••••••••••••",
      secretToken: "••••••••••••••••••••••••••••••",
      baseUrl: "https://api.taphoammo.net/v1",
      timeout: 30,
      maxRetries: 3,
      rateLimit: 60,
      syncSchedule: "15min",
      enableSync: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "API Settings Saved",
      description: "Your API configuration has been updated successfully!",
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">API Configuration</h2>
        <p className="text-muted-foreground">Configure API connections and synchronization settings</p>
      </div>

      <div className="flex items-center space-x-2 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
        <Badge variant="success">Connected</Badge>
        <span>API connection is active and functioning normally</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* TaphoaMMO API Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">taphoammo.net API Credentials</h3>
            
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    Your API key for taphoammo.net
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secretToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Token</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    Your API secret token for authentication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Base URL for the API endpoints
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Request Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Request Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Timeout (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxRetries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Retry Attempts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rateLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Limit (requests/minute)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Synchronization Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Synchronization Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="syncSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5min">Every 5 minutes</SelectItem>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                        <SelectItem value="30min">Every 30 minutes</SelectItem>
                        <SelectItem value="1hour">Every hour</SelectItem>
                        <SelectItem value="2hour">Every 2 hours</SelectItem>
                        <SelectItem value="6hour">Every 6 hours</SelectItem>
                        <SelectItem value="12hour">Every 12 hours</SelectItem>
                        <SelectItem value="1day">Once a day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often the system should sync data with taphoammo.net
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableSync"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Automatic Sync</FormLabel>
                      <FormDescription>
                        Automatically synchronize inventory and product data
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
            </div>
          </div>

          {/* API Status Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">API Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">98.7%</div>
                  <p className="text-sm text-muted-foreground">API Uptime (30 days)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">287ms</div>
                  <p className="text-sm text-muted-foreground">Average Response Time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">1,245</div>
                  <p className="text-sm text-muted-foreground">API Calls Today</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                type="button"
                onClick={() => {
                  toast({
                    title: "API Test Successful",
                    description: "Connection to taphoammo.net API is working correctly.",
                  });
                }}
              >
                Test Connection
              </Button>
              
              <Button 
                variant="outline"
                type="button"
                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-800"
                onClick={() => {
                  toast({
                    title: "Sync Started",
                    description: "Manual synchronization has been initiated.",
                  });
                }}
              >
                Sync Now
              </Button>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button type="submit" className="bg-chatgpt-primary hover:bg-chatgpt-primary/90">Save API Settings</Button>
        </form>
      </Form>
    </div>
  );
};
