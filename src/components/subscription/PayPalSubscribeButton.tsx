
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { usePayPalSubscription } from '@/hooks/usePayPalSubscription';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Default URLs if not provided
  const defaultReturnUrl = window.location.origin + '/subscription/success';
  const defaultCancelUrl = window.location.origin + '/subscription/cancel';
  
  const handleShowPayPal = () => {
    setShowPayPal(true);
  };
  
  const handleCreateSubscription = async () => {
    try {
      const result = await createSubscription({
        planId,
        returnUrl: returnUrl || defaultReturnUrl,
        cancelUrl: cancelUrl || defaultCancelUrl,
      });
      
      if (result && result.approval_url) {
        // Redirect to PayPal for approval
        window.location.href = result.approval_url;
        return result.subscription_id;
      }
      return null;
    } catch (error) {
      console.error("Error creating subscription:", error);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    }
  };
  
  if (isPending || isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
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
            if (data.subscriptionID) {
              // Complete the subscription on our backend
              const subscription = await completeSubscription({
                subscriptionId: data.subscriptionID
              });
              
              if (subscription && onSuccess) {
                onSuccess(subscription.id);
              }
              
              // Navigate to success page
              navigate('/subscription/success', {
                state: { 
                  subscriptionId: data.subscriptionID,
                  planName
                }
              });
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
          }}
          onCancel={() => {
            setShowPayPal(false);
            // Navigate to cancel page or stay on current page
            navigate('/subscription/cancel', {
              state: { 
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
    >
      Subscribe with PayPal
    </Button>
  );
}
