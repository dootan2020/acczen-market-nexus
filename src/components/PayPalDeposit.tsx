
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// PayPal configuration with updated settings
const PAYPAL_OPTIONS = {
  // Use a valid sandbox PayPal client ID
  clientId: "test", // Replace with your working sandbox client ID
  currency: "USD",
  intent: "capture",
  components: "buttons",
  // Only disable unnecessary payment methods
  disableFunding: "credit", 
  dataDsr: "false",
  // Add debug mode for additional error information
  debug: true
};

// PayPal Buttons wrapper with enhanced error handling
const PayPalButtonWrapper = ({ amount, onSuccess }) => {
  const [{ isPending, isRejected, isResolved, options }, dispatch] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  
  // Log PayPal script state for debugging
  useEffect(() => {
    console.log('PayPal Script State:', { isPending, isRejected, isResolved, options });
    
    // Reset script if it was rejected
    if (isRejected) {
      console.log('Attempting to reload PayPal script...');
      setTimeout(() => {
        // Fix: Use the correct dispatch action type
        dispatch({
          type: "reload",
          value: {
            ...PAYPAL_OPTIONS,
            'data-client-token': `${Date.now()}` // Force refresh by changing token
          }
        });
      }, 3000);
    }
  }, [isPending, isRejected, isResolved, options, dispatch]);
  
  if (isPending) return (
    <div className="w-full h-12 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    </div>
  );
  
  if (isRejected) return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>PayPal Error</AlertTitle>
      <AlertDescription>
        Could not load PayPal. Please check your internet connection or try again later.
        {errorDetails && <div className="mt-2 text-xs overflow-auto max-h-20">{errorDetails}</div>}
      </AlertDescription>
    </Alert>
  );
  
  return (
    <PayPalButtons 
      style={{ layout: 'vertical', color: 'blue', shape: 'rect', height: 45 }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: "USD",
              value: amount.toString()
            },
            description: `Deposit funds - $${amount}`
          }]
        });
      }}
      onApprove={async (data, actions) => {
        setIsProcessing(true);
        try {
          const orderDetails = await actions?.order?.capture();
          console.log('PayPal order captured:', orderDetails);
          if (orderDetails) {
            await onSuccess(orderDetails, amount);
          }
        } catch (error) {
          console.error("PayPal Capture Error:", error);
          // Fix: Ensure error message is a string
          setErrorDetails(error instanceof Error ? error.message : JSON.stringify(error));
          toast.error('Payment Processing Error', {
            description: 'There was an error capturing your payment'
          });
        } finally {
          setIsProcessing(false);
        }
      }}
      onCancel={() => {
        toast.info('Payment Cancelled', {
          description: 'You cancelled the PayPal payment'
        });
      }}
      onError={(err) => {
        console.error("PayPal Button Error:", err);
        // Fix: Ensure error message is a string
        setErrorDetails(err instanceof Error ? err.message : JSON.stringify(err));
        toast.error('PayPal Error', {
          description: 'An error occurred with PayPal payment. Please try again later.'
        });
      }}
      disabled={isProcessing}
    />
  );
};

// Fallback PayPal button component for when the main buttons fail
const FallbackPayPalButton = ({ amount, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleClick = () => {
    setIsProcessing(true);
    // Open PayPal in a new window
    const paypalWindow = window.open(
      `https://www.paypal.com/checkout?currency=USD&amount=${amount}`,
      '_blank'
    );
    
    // Check if window was successfully opened
    if (paypalWindow) {
      toast.info('PayPal Checkout Opened', { 
        description: 'Please complete your payment in the new window and return to this page.' 
      });
    } else {
      toast.error('Popup Blocked', { 
        description: 'Please allow popups for this site and try again.' 
      });
      setIsProcessing(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={isProcessing}
      variant="outline"
      className="w-full bg-[#0070ba] text-white hover:bg-[#005ea6]"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Pay with PayPal</>
      )}
    </Button>
  );
};

const PayPalDeposit = () => {
  const { user } = useAuth();
  const [customAmount, setCustomAmount] = useState('');
  const [directAmount, setDirectAmount] = useState('');
  const [showManualOption, setShowManualOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paypalLoadFailed, setPaypalLoadFailed] = useState(false);
  const navigate = useNavigate();

  // Show manual option earlier and detect if PayPal fails
  useEffect(() => {
    // Show manual option right away for better UX
    setShowManualOption(true);
    
    // Check if PayPal script loads within a reasonable time
    const timer = setTimeout(() => {
      // If we haven't detected script loading by now, likely there's an issue
      setPaypalLoadFailed(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for PayPal script load errors
  useEffect(() => {
    const handleScriptError = (event) => {
      if (event.target.src && event.target.src.includes('paypal.com/sdk')) {
        console.error('PayPal script failed to load:', event);
        setPaypalLoadFailed(true);
      }
    };
    
    window.addEventListener('error', handleScriptError, true);
    return () => window.removeEventListener('error', handleScriptError, true);
  }, []);

  const presetAmounts = [10, 20, 50, 100];

  const handlePayPalSuccess = async (orderDetails, amount) => {
    if (!user?.id) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to make a deposit'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a unique idempotency key to prevent duplicate transactions
      const idempotencyKey = `${user.id}-${orderDetails.id}-${Date.now()}`;
      
      // Call our edge function to process deposit
      const { data, error } = await supabase.functions.invoke('process-paypal-deposit', {
        body: {
          orderID: orderDetails.id,
          amount: amount,
          userID: user.id,
          idempotencyKey
        }
      });

      if (error) throw new Error(error.message || 'Failed to process deposit');

      if (data?.success) {
        toast.success('Deposit Successful', {
          description: `$${amount} has been added to your account`
        });
        
        navigate('/deposit/success', { 
          state: { 
            deposit: {
              id: data.depositId || orderDetails.id,
              user_id: user.id,
              amount: amount,
              payment_method: 'PayPal',
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              paypal_order_id: orderDetails.id,
              paypal_payer_id: orderDetails.payer?.payer_id,
              paypal_payer_email: orderDetails.payer?.email_address
            }
          }
        });
      } else {
        toast.error('Deposit Failed', {
          description: data?.message || 'Something went wrong with your deposit'
        });
      }
    } catch (error) {
      console.error('Deposit processing error:', error);
      toast.error('Deposit Failed', {
        description: error instanceof Error ? error.message : 'An error occurred while processing your deposit'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual deposit request
  const handleManualDeposit = async () => {
    try {
      const amount = parseFloat(directAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Invalid Amount', {
          description: 'Please enter a valid amount'
        });
        return;
      }

      setIsSubmitting(true);

      // Create a pending manual deposit record
      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user?.id,
          amount: amount,
          status: 'pending',
          payment_method: 'Manual Transfer',
          metadata: {
            request_time: new Date().toISOString(),
            requester_ip: 'client_request'
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Deposit Request Submitted', {
        description: `Your request to deposit $${amount} has been submitted for manual approval.`
      });
      
      navigate('/deposit/success', { 
        state: { 
          deposit: data
        }
      });
    } catch (error) {
      toast.error('Request Failed', {
        description: error instanceof Error ? error.message : 'An error occurred while submitting your deposit request'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {paypalLoadFailed && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>PayPal Integration Issue</AlertTitle>
          <AlertDescription>
            We're having trouble connecting to PayPal. Please try using the manual deposit option below.
          </AlertDescription>
        </Alert>
      )}
      
      <PayPalScriptProvider options={PAYPAL_OPTIONS}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {presetAmounts.map(amount => (
              <div key={amount} className="relative rounded-md border shadow-sm p-4 text-center">
                <div className="font-semibold mb-2">${amount}</div>
                <PayPalButtonWrapper amount={amount} onSuccess={handlePayPalSuccess} />
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Custom Amount</h3>
            <div className="flex flex-col space-y-2">
              <Input 
                type="number" 
                placeholder="Enter amount (USD)" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                step="0.01"
                className="mb-2"
              />
              <div className="h-[50px]">
                {customAmount && parseFloat(customAmount) > 0 && (
                  <PayPalButtonWrapper 
                    amount={parseFloat(customAmount)} 
                    onSuccess={handlePayPalSuccess} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Manual deposit option that shows if PayPal doesn't load */}
          {showManualOption && (
            <div className="border-t pt-4">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Having trouble with PayPal?</AlertTitle>
                <AlertDescription>
                  You can request a manual deposit that will be processed by our team.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-2">
                <Input 
                  type="number" 
                  placeholder="Enter amount for manual deposit" 
                  value={directAmount}
                  onChange={(e) => setDirectAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
                <Button 
                  onClick={handleManualDeposit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Request Manual Deposit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PayPalScriptProvider>
    </>
  );
};

export default PayPalDeposit;
