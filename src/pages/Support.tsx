
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Container } from '@/components/ui/container';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, HelpCircle, MessageSquare, Mail, Phone, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const supportFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  issueType: z.string().min(1, { message: "Please select an issue type." }),
  orderId: z.string().optional(),
  description: z.string().min(10, { message: "Please provide more details (minimum 10 characters)." }),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

const SupportPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      issueType: "",
      orderId: "",
      description: "",
    },
  });

  const onSubmit = async (data: SupportFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the form data to your backend
      console.log("Form submitted:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Support request submitted",
        description: "We've received your request and will get back to you soon.",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F7F7F8] to-background pt-12 pb-16">
        <Container>
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Support</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#202123]">
              Customer Support
            </h1>
            <p className="text-lg text-[#8E8EA0] mb-6">
              We're here to help you with any questions or issues you might have. 
              Our team is dedicated to providing you with the best support experience.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Support Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="issueType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select issue type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="order">Order Problem</SelectItem>
                                <SelectItem value="account">Account Issues</SelectItem>
                                <SelectItem value="payment">Payment Problem</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="orderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Order ID <span className="text-muted-foreground text-xs">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. ORD-12345" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              If your issue is related to a specific order
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe your issue</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide as much detail as possible..."
                              className="h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
                      Submit Support Request
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Live Chat Widget (Placeholder) */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-[#19C37D]/10">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-[#19C37D]" />
                  <CardTitle className="text-lg">Live Chat Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-muted p-8 rounded-md text-center">
                  <p className="text-muted-foreground mb-4">Our live chat support is coming soon!</p>
                  <Button variant="outline" disabled>
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - Contact Info & Self-help */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-[#19C37D] mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email Support</h4>
                    <a href="mailto:support@acczen.net" className="text-[#19C37D] hover:underline">
                      support@acczen.net
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-[#19C37D] mt-0.5" />
                  <div>
                    <h4 className="font-medium">Phone Support</h4>
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-[#19C37D] mt-0.5" />
                  <div>
                    <h4 className="font-medium">Support Hours</h4>
                    <p className="text-muted-foreground">24/7 - We're always here for you</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Self-help Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Self-Help Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <Link to="/how-it-works" className="flex items-center hover:text-[#19C37D] transition-colors">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>How AccZen.net Works</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="flex items-center hover:text-[#19C37D] transition-colors">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>Frequently Asked Questions</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/categories" className="flex items-center hover:text-[#19C37D] transition-colors">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>Product Categories</span>
                    </Link>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-[#19C37D]/10 rounded-md">
                  <h4 className="font-medium flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 mr-2 text-[#19C37D]" />
                    Quick Tip
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Check out our detailed <Link to="/how-it-works" className="text-[#19C37D] hover:underline">How it Works</Link> guide 
                    for answers to common questions about using AccZen.net.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SupportPage;
