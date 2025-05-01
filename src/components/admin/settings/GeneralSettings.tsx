
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  siteTitle: z.string().min(2, { message: "Site title must be at least 2 characters." }),
  siteDescription: z.string(),
  contactEmail: z.string().email({ message: "Please enter a valid email address." }),
  supportPhone: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
});

export const GeneralSettings = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteTitle: "Digital Deals Hub",
      siteDescription: "Platform for digital products and services",
      contactEmail: "support@example.com",
      supportPhone: "+1 (555) 123-4567",
      maintenanceMode: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated successfully!",
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">General Settings</h2>
        <p className="text-muted-foreground">Manage your website's general settings</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Site Information</h3>

            <FormField
              control={form.control}
              name="siteTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digital Deals Hub" />
                  </FormControl>
                  <FormDescription>
                    This will be displayed in the browser tab and throughout the site.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description of your website"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This may be used for SEO and appears in search results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Logo</h3>
            <div className="grid gap-4">
              <div className="border rounded p-6 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-muted-foreground">Current Logo</p>
                </div>
                <Button variant="outline" className="bg-chatgpt-primary/5 border-chatgpt-primary/20 text-chatgpt-primary hover:bg-chatgpt-primary/10">
                  Upload New Logo
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended size: 512×512px, Max size: 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="support@example.com" />
                  </FormControl>
                  <FormDescription>
                    Public contact email displayed to users.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supportPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Support Phone (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1 (555) 123-4567" />
                  </FormControl>
                  <FormDescription>
                    Optional phone number for customer support.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Site Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Site Status</h3>

            <FormField
              control={form.control}
              name="maintenanceMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Maintenance Mode</FormLabel>
                    <FormDescription>
                      When enabled, the site will show a maintenance page to all users except administrators.
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

          {/* Submit Button */}
          <Button type="submit" className="bg-chatgpt-primary hover:bg-chatgpt-primary/90">Save Settings</Button>
        </form>
      </Form>
    </div>
  );
};
