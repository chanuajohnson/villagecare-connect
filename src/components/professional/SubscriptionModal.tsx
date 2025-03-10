
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
}

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ open, onClose }: SubscriptionModalProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const { user } = useAuth();
  
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
        
      if (error) {
        console.error('Error fetching subscription plans:', error);
        toast.error('Failed to load subscription plans');
        return;
      }
      
      setPlans(data);
    } catch (err) {
      console.error('Error in fetchPlans:', err);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);
  
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('You must be logged in to subscribe');
      return;
    }
    
    try {
      setSubscribing(true);
      
      // Calculate end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);
      
      // Create subscription record
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          end_date: endDate.toISOString()
        });
        
      if (error) {
        console.error('Error creating subscription:', error);
        toast.error('Failed to subscribe to plan');
        return;
      }
      
      toast.success(`You have successfully subscribed to the ${plan.name} plan!`);
      onClose();
      
      // In a real app, you would integrate with a payment processor here
      
    } catch (err) {
      console.error('Error in handleSubscribe:', err);
      toast.error('Failed to subscribe to plan');
    } finally {
      setSubscribing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a Subscription Plan</DialogTitle>
          <DialogDescription>
            Subscribe to unlock the ability to contact professional caregivers directly.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-t-primary border-b-transparent border-l-transparent border-r-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all">
                <CardHeader className="bg-muted/50">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-3xl font-bold">${plan.price}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="bg-muted/30 px-6 py-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing}
                  >
                    {subscribing ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 p-2">
          <Info className="h-4 w-4" />
          <span>
            This is a demo. In a production app, you would be connected to a payment processor.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
