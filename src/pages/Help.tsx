
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Mail, Phone, MessageCircle, FileText, HelpCircle, CreditCard } from "lucide-react";

const Help = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Help Center & FAQ</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions and learn how to use our platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="general">
              <HelpCircle className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="products">
              <FileText className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General FAQ</CardTitle>
                <CardDescription>Answers to common questions about our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is Digital Deals Hub?</AccordionTrigger>
                    <AccordionContent>
                      Digital Deals Hub is an e-commerce platform specializing in digital products for the Make Money Online (MMO) market. We offer email accounts, social media accounts, software keys, and other digital products to international customers.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I create an account?</AccordionTrigger>
                    <AccordionContent>
                      Creating an account is simple. Click on the "Sign Up" button in the top right corner, enter your email address and create a password. You'll receive a verification email to activate your account. Once verified, you can start browsing and purchasing products.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is my personal information safe?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent. Our platform uses industry-standard security protocols to protect all transactions and user data.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How can I reset my password?</AccordionTrigger>
                    <AccordionContent>
                      If you forgot your password, click on the "Log In" button, then click "Forgot Password". Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Can I use the platform on mobile devices?</AccordionTrigger>
                    <AccordionContent>
                      Yes, our platform is fully responsive and works on all devices including smartphones and tablets. You can browse products, make purchases, and manage your account from any device with an internet connection.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments FAQ</CardTitle>
                <CardDescription>Information about deposits, payments, and transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">PayPal Deposits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="paypal-1">
                          <AccordionTrigger>How do I deposit using PayPal?</AccordionTrigger>
                          <AccordionContent>
                            To deposit using PayPal, navigate to the Deposit page, select the PayPal option, choose an amount or enter a custom amount, and click the PayPal button. You'll be redirected to PayPal to complete the payment. Once confirmed, funds will be added to your account instantly.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="paypal-2">
                          <AccordionTrigger>Are there any fees for PayPal deposits?</AccordionTrigger>
                          <AccordionContent>
                            We don't charge any fees for PayPal deposits. However, PayPal may apply its own fees depending on your account type and country. The amount shown during checkout is the exact amount that will be added to your balance.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="paypal-3">
                          <AccordionTrigger>How long do PayPal deposits take?</AccordionTrigger>
                          <AccordionContent>
                            PayPal deposits are processed instantly. Once the payment is confirmed by PayPal, the funds are immediately added to your account balance. You can start using your funds for purchases right away.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">USDT Deposits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="usdt-1">
                          <AccordionTrigger>How do I deposit using USDT (TRC20)?</AccordionTrigger>
                          <AccordionContent>
                            To deposit using USDT, go to the Deposit page and select the USDT option. You'll see our wallet address - send your USDT to this address using the TRC20 network only. After sending, enter the transaction hash (TXID) and amount in the form and submit for verification.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="usdt-2">
                          <AccordionTrigger>How long do USDT deposits take to process?</AccordionTrigger>
                          <AccordionContent>
                            USDT deposits typically take 1-5 minutes to be confirmed on the blockchain. Once confirmed, our system will automatically verify and credit your account. Manual verification by our team may take up to 30 minutes during business hours.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="usdt-3">
                          <AccordionTrigger>Which USDT networks do you support?</AccordionTrigger>
                          <AccordionContent>
                            We currently only support USDT on the TRON (TRC20) network. Please do not send USDT using other networks like ERC20 (Ethereum) or BEP20 (Binance Smart Chain) as these transactions cannot be processed and may result in lost funds.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">General Payment Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="payment-1">
                        <AccordionTrigger>How do I check my balance?</AccordionTrigger>
                        <AccordionContent>
                          Your current balance is always displayed in the top right corner of the site when you're logged in. You can also view your full transaction history in the Dashboard section under "Transactions".
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="payment-2">
                        <AccordionTrigger>What happens if my deposit doesn't show up?</AccordionTrigger>
                        <AccordionContent>
                          If your deposit doesn't appear within the expected time frame (instantly for PayPal or 30 minutes for USDT), please contact customer support with your transaction details. For USDT deposits, make sure you've used the correct network (TRC20) and wallet address.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="payment-3">
                        <AccordionTrigger>Can I get a refund?</AccordionTrigger>
                        <AccordionContent>
                          Due to the digital nature of our products, all sales are generally final. However, if you experience issues with a product, please contact our support team within 24 hours of purchase, and we'll work to resolve the issue or provide a replacement.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="payment-4">
                        <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                        <AccordionContent>
                          We currently accept PayPal and USDT (TRC20) for deposits. We're continually working to add more payment methods to make transactions more convenient for our international customers.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products FAQ</CardTitle>
                <CardDescription>Information about our digital products and services</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What kinds of products do you offer?</AccordionTrigger>
                    <AccordionContent>
                      We offer a wide range of digital products including email accounts, social media accounts, software licenses, and various digital tools for online marketers. All our products are categorized for easy browsing. You can filter products by category, price, and features.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I access my purchased products?</AccordionTrigger>
                    <AccordionContent>
                      After purchasing a product, you can access it immediately in your Dashboard under "My Products." For accounts and licenses, you'll find login credentials and activation keys. For software, you'll receive download links and installation instructions.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Are your products guaranteed to work?</AccordionTrigger>
                    <AccordionContent>
                      Yes, all our products are tested before being listed. However, due to the nature of digital products, we can't guarantee they'll meet every specific need or work in all environments. If you experience any issues, our customer support team is available to help.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Do you provide product support?</AccordionTrigger>
                    <AccordionContent>
                      Basic setup support is included with all purchases. For more complex products, we provide detailed documentation and guides. Premium support packages are available for purchase if you need additional assistance or custom configurations.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How long will I have access to my products?</AccordionTrigger>
                    <AccordionContent>
                      This depends on the product. Some products like software licenses have specific validity periods (30 days, 1 year, lifetime, etc.). Account-based products typically provide indefinite access, but may be subject to the terms of the service provider. The duration of access is clearly mentioned in each product description.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Email Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        For general inquiries, account issues, or product support, email our team:
                      </p>
                      <p className="font-medium">support@digitaldealshub.com</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Response time: Usually within 24 hours
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open('mailto:support@digitaldealshub.com')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Live Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Need immediate assistance? Chat with our support team directly:
                      </p>
                      <p className="font-medium">Available 24/7 for urgent issues</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click the chat button in the bottom right corner of any page
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Live Chat
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="mt-6 bg-muted p-6 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Need Help Fast?</h3>
                  <p className="mb-4">Check out these resources for quick assistance:</p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                      <span>Browse our <a href="#" className="text-primary hover:underline">comprehensive guides</a> for step-by-step instructions</span>
                    </li>
                    <li className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                      <span>View <a href="#" className="text-primary hover:underline">video tutorials</a> for visual help with our platform</span>
                    </li>
                    <li className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                      <span>For business inquiries, call us at <strong>+1 (555) 123-4567</strong> during business hours</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Help;
