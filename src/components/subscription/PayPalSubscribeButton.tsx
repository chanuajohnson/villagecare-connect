
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { usePayPalSubscription } from '@/hooks/usePayPalSubscription';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface PayPalSubscribeButtonProps {
  planId: string;
  planName: string;
  price: string;
  returnUrl?: string;
  cancelUrl?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
}

export function PayPalSubscribeButton({
  planId,
  planName,
  price,
  returnUrl,
  cancelUrl,
  variant = "default",
  className = "",
  onSuccess,
  onError
}: PayPalSubscribeButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const { createSubscription, completeSubscription, isLoading } = usePayPalSubscription();
  const [showPayPal, setShowPayPal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  
  // Default URLs if not provided
  const defaultReturnUrl = window.location.origin + '/subscription/success';
  const defaultCancelUrl = window.location.origin + '/subscription/cancel';
  
  const handleShowPayPal = () => {
    setShowPayPal(true);
  };
  
  const handleCreateSubscription = async () => {
    try {
      setProcessingPayment(true);
      console.log(`Creating subscription for plan: ${planId} (${planName})`);
      
      const result = await createSubscription({
        planId,
        returnUrl: returnUrl || defaultReturnUrl,
        cancelUrl: cancelUrl || defaultCancelUrl,
      });
      
      if (!result) {
        console.error("No result from createSubscription");
        throw new Error("Failed to initiate subscription");
      }
      
      console.log("Subscription creation result:", result);
      
      if (result.approval_url) {
        // Direct redirect flow
        console.log("Redirecting to PayPal approval URL:", result.approval_url);
        window.location.href = result.approval_url;
        return result.subscription_id;
      } else {
        console.error("No approval URL in response", result);
        throw new Error("Missing PayPal approval URL");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      
      // Show toast with error
      toast({
        title: "Subscription Error",
        description: error instanceof Error 
          ? error.message 
          : "An unknown error occurred while creating your subscription",
        variant: "destructive",
      });
      
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    } finally {
      setProcessingPayment(false);
    }
  };
  
  if (isPending || isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }
  
  if (processingPayment) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }
  
  if (showPayPal) {
    return (
      <div className={`w-full ${className}`}>
        <Button 
          variant="outline" 
          size="sm"
          className="mb-2 w-full"
          onClick={() => setShowPayPal(false)}
        >
          Cancel
        </Button>
        <PayPalButtons
          style={{ layout: "vertical", tagline: false }}
          createSubscription={handleCreateSubscription}
          onApprove={async (data) => {
            try {
              console.log("PayPal subscription approved:", data);
              setProcessingPayment(true);
              
              if (!data.subscriptionID) {
                throw new Error("No subscription ID received from PayPal");
              }
              
              // Complete the subscription on our backend
              const subscription = await completeSubscription({
                subscriptionId: data.subscriptionID
              });
              
              if (!subscription) {
                throw new Error("Failed to complete subscription");
              }
              
              console.log("Subscription completed:", subscription);
              
              if (onSuccess) {
                onSuccess(subscription.id);
              }
              
              // Show success toast
              toast({
                title: "Subscription Activated",
                description: `Your ${planName} subscription has been activated successfully!`,
                variant: "default",
              });
              
              // Navigate to success page
              navigate('/subscription/success', {
                state: { 
                  subscriptionId: data.subscriptionID,
                  planName
                }
              });
            } catch (error) {
              console.error("Error completing subscription:", error);
              
              // Show error toast
              toast({
                title: "Subscription Error",
                description: error instanceof Error 
                  ? error.message 
                  : "An unknown error occurred while activating your subscription",
                variant: "destructive",
              });
              
              if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
              
              // Navigate to error page
              navigate('/subscription/cancel', {
                state: { 
                  error: error instanceof Error ? error.message : "Unknown error",
                  planName
                }
              });
            } finally {
              setProcessingPayment(false);
            }
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            // Convert PayPal error object to Error instance before passing to onError
            if (onError) {
              const errorMessage = typeof err === 'object' && err !== null && 'message' in err 
                ? String(err.message) 
                : 'PayPal subscription error';
              onError(new Error(errorMessage));
            }
            
            // Show error toast
            toast({
              title: "PayPal Error",
              description: typeof err === 'object' && err !== null && 'message' in err 
                ? String(err.message) 
                : 'An error occurred with PayPal. Please try again.',
              variant: "destructive",
            });
          }}
          onCancel={() => {
            console.log("PayPal subscription cancelled by user");
            setShowPayPal(false);
            
            // Navigate to cancel page or stay on current page
            navigate('/subscription/cancel', {
              state: { 
                cancelled: true,
                planName
              }
            });
          }}
        />
      </div>
    );
  }
  
  return (
    <Button 
      onClick={handleShowPayPal} 
      variant={variant} 
      className={className}
      disabled={processingPayment}
    >
      {processingPayment ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Subscribe with PayPal'
      )}
    </Button>
  );
}
