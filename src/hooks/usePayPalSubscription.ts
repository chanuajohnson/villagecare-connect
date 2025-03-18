
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useTracking } from './useTracking';

interface CreateSubscriptionParams {
  planId: string;
  returnUrl: string;
  cancelUrl: string;
}

interface CompleteSubscriptionParams {
  subscriptionId: string;
}

export function usePayPalSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();
  const { trackEngagement } = useTracking();

  /**
   * Create a new PayPal subscription
   */
  const createSubscription = async ({ planId, returnUrl, cancelUrl }: CreateSubscriptionParams) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to subscribe",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);

      // Track subscription initiation
      await trackEngagement('subscription_initiated', {
        plan_id: planId,
        payment_method: 'paypal',
      });

      // Call our edge function to create the subscription
      const { data, error } = await supabase.functions.invoke('paypal-create-subscription', {
        body: {
          planId,
          userId: user.id,
          returnUrl,
          cancelUrl,
        },
      });

      if (error) {
        console.error('Error creating PayPal subscription:', error);
        toast({
          title: "Subscription Error",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Track successful creation (but not completion yet)
      await trackEngagement('subscription_created', {
        subscription_id: data.subscription_id,
        paypal_subscription_id: data.paypal_subscription_id,
        plan_id: planId,
      });

      return data;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      toast({
        title: "Subscription Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete a PayPal subscription after user approval
   */
  const completeSubscription = async ({ subscriptionId }: CompleteSubscriptionParams) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to complete subscription",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsCompleting(true);

      // Call our edge function to complete the subscription
      const { data, error } = await supabase.functions.invoke('paypal-complete-subscription', {
        body: {
          subscription_id: subscriptionId,
        },
      });

      if (error) {
        console.error('Error completing PayPal subscription:', error);
        toast({
          title: "Subscription Error",
          description: "Failed to complete subscription. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Track successful completion
      await trackEngagement('subscription_completed', {
        subscription_id: subscriptionId,
        status: data.subscription.status,
        plan_id: data.subscription.plan_id,
        payment_method: 'paypal',
      });

      toast({
        title: "Subscription Active",
        description: "Your subscription has been activated successfully!",
        variant: "default",
      });

      return data.subscription;
    } catch (error) {
      console.error('Error in completeSubscription:', error);
      toast({
        title: "Subscription Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCompleting(false);
    }
  };

  /**
   * Get user's current subscription details
   */
  const getUserSubscription = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          plan_id,
          start_date,
          end_date,
          paypal_subscription_id,
          payment_method,
          subscription_plans (
            name,
            price,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  };

  return {
    createSubscription,
    completeSubscription,
    getUserSubscription,
    isLoading,
    isCompleting,
  };
}
