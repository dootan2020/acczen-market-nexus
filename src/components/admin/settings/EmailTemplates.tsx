
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';

interface TemplateVariables {
  [key: string]: string;
}

const templates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Digital Deals Hub!',
    content: `<p>Hi {{user_name}},</p>
<p>Welcome to Digital Deals Hub! We're excited to have you join our community.</p>
<p>With your new account, you can:</p>
<ul>
  <li>Browse our catalog of premium digital products</li>
  <li>Make secure purchases</li>
  <li>Track your order history</li>
  <li>Receive special offers</li>
</ul>
<p>If you have any questions, please don't hesitate to contact our support team at {{support_email}}.</p>
<p>Best regards,<br>The Digital Deals Hub Team</p>`,
    variables: {
      user_name: 'Customer Name',
      support_email: 'support@example.com'
    }
  },
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    subject: 'Your Order #{{order_id}} Confirmation',
    content: `<p>Hi {{user_name}},</p>
<p>Thank you for your purchase! Your order #{{order_id}} has been confirmed.</p>
<p><strong>Order Details:</strong></p>
<p>Date: {{order_date}}<br>
Total: {{order_total}}<br>
Payment Method: {{payment_method}}</p>
<p><strong>Order Items:</strong></p>
<p>{{order_items}}</p>
<p>You can view your purchase details in your <a href="{{account_url}}">account dashboard</a>.</p>
<p>If you have any questions, please contact us at {{support_email}}.</p>
<p>Best regards,<br>The Digital Deals Hub Team</p>`,
    variables: {
      user_name: 'Customer Name',
      order_id: 'DDH12345',
      order_date: 'May 1, 2025',
      order_total: '$99.99',
      payment_method: 'Credit Card',
      order_items: 'Product list here...',
      account_url: 'https://example.com/account',
      support_email: 'support@example.com'
    }
  },
  {
    id: 'deposit_confirmation',
    name: 'Deposit Confirmation',
    subject: 'Your Deposit of {{deposit_amount}} Confirmed',
    content: `<p>Hi {{user_name}},</p>
<p>We're happy to confirm that your deposit of {{deposit_amount}} has been successfully processed.</p>
<p><strong>Transaction Details:</strong></p>
<p>Date: {{deposit_date}}<br>
Transaction ID: {{transaction_id}}<br>
Payment Method: {{payment_method}}<br>
New Balance: {{new_balance}}</p>
<p>You can view your transaction history in your <a href="{{account_url}}">account dashboard</a>.</p>
<p>If you didn't make this deposit, please contact us immediately at {{support_email}}.</p>
<p>Best regards,<br>The Digital Deals Hub Team</p>`,
    variables: {
      user_name: 'Customer Name',
      deposit_amount: '$100.00',
      deposit_date: 'May 1, 2025',
      transaction_id: 'TXN12345',
      payment_method: 'PayPal',
      new_balance: '$250.00',
      account_url: 'https://example.com/account',
      support_email: 'support@example.com'
    }
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    content: `<p>Hi {{user_name}},</p>
<p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
<p>To reset your password, click the link below:</p>
<p><a href="{{reset_link}}">Reset Your Password</a></p>
<p>This link will expire in {{expiry_time}} hours.</p>
<p>If you're having trouble with the link, copy and paste the following URL into your browser:</p>
<p>{{reset_link}}</p>
<p>Best regards,<br>The Digital Deals Hub Team</p>`,
    variables: {
      user_name: 'Customer Name',
      reset_link: 'https://example.com/reset-password?token=xyz',
      expiry_time: '24'
    }
  }
];

export const EmailTemplates = () => {
  const { toast } = useToast();
  const [activeTemplate, setActiveTemplate] = useState('welcome');
  const [previewHtml, setPreviewHtml] = useState(templates[0].content);
  const [testEmail, setTestEmail] = useState('');
  
  const form = useForm({
    defaultValues: {
      subject: templates[0].subject,
      content: templates[0].content
    }
  });
  
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setActiveTemplate(templateId);
      form.setValue('subject', template.subject);
      form.setValue('content', template.content);
      setPreviewHtml(template.content);
    }
  };
  
  const handlePreviewUpdate = (content: string) => {
    const template = templates.find(t => t.id === activeTemplate);
    if (template) {
      let html = content;
      
      // Replace variables with sample values
      Object.entries(template.variables).forEach(([key, value]) => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      
      setPreviewHtml(html);
    }
  };
  
  const onSubmit = (data: any) => {
    console.log(data);
    toast({
      title: "Email Template Saved",
      description: `The ${templates.find(t => t.id === activeTemplate)?.name} template has been updated.`,
    });
  };
  
  const handleSendTest = () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Test Email Sent",
      description: `A test email has been sent to ${testEmail}.`,
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <p className="text-muted-foreground">Customize email templates sent to users</p>
      </div>
      
      <Tabs value={activeTemplate} onValueChange={handleTemplateChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
          {templates.map(template => (
            <TabsTrigger 
              key={template.id} 
              value={template.id}
              className="data-[state=active]:bg-chatgpt-primary data-[state=active]:text-white"
            >
              {template.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {templates.map(template => (
          <TabsContent key={template.id} value={template.id} className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Editor Column */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel>Email Subject</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Content</FormLabel>
                              <FormControl>
                                <textarea 
                                  className="w-full min-h-[300px] border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePreviewUpdate(e.target.value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Available Variables</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(template.variables).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {`{{${key}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Column */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-medium mb-3">Preview</h3>
                        <div className="border rounded-md bg-white p-4">
                          <div className="border-b pb-2 mb-3">
                            <div className="text-sm text-muted-foreground">From: Digital Deals Hub &lt;noreply@example.com&gt;</div>
                            <div className="text-sm text-muted-foreground">To: {template.variables.user_name || 'Customer'} &lt;customer@example.com&gt;</div>
                            <div className="text-sm font-medium mt-1">
                              Subject: {form.watch('subject').replace(/{{([^}]+)}}/g, (match, key) => template.variables[key] || match)}
                            </div>
                          </div>
                          <div 
                            className="prose prose-sm max-w-none" 
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-medium mb-3">Send Test Email</h3>
                        <div className="flex gap-2">
                          <Input 
                            type="email" 
                            placeholder="Enter email address" 
                            value={testEmail} 
                            onChange={(e) => setTestEmail(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            onClick={handleSendTest} 
                            className="bg-chatgpt-primary hover:bg-chatgpt-primary/90"
                          >
                            <Send className="h-4 w-4 mr-2" /> Send Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Button type="submit" className="bg-chatgpt-primary hover:bg-chatgpt-primary/90">Save Template</Button>
              </form>
            </Form>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
