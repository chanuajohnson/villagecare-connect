
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  billingPeriod: string;
  features: string[];
  recommendedFor: string;
  isPopular?: boolean;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Profile | null;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    billingPeriod: 'month',
    features: [
      'Contact up to 5 caregivers per month',
      'Basic filtering options',
      'Message caregivers directly',
      'View public profiles',
    ],
    recommendedFor: 'Occasional users seeking limited caregiver contacts'
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$19.99',
    billingPeriod: 'month',
    features: [
      'Contact up to 15 caregivers per month',
      'Advanced filtering options',
      'Priority message status',
      'Save favorite caregivers',
      'Background check verification',
    ],
    recommendedFor: 'Regular users needing moderate caregiver contacts',
    isPopular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$29.99',
    billingPeriod: 'month',
    features: [
      'Unlimited caregiver contacts',
      'Advanced filtering and search',
      'Priority support',
      'Urgent request handling',
      'Background check verification',
      'Caregiver recommendations',
      'Dedicated account manager',
    ],
    recommendedFor: 'Power users needing unlimited access to caregivers'
  }
];

export const SubscriptionModal = ({ isOpen, onClose, professional }: SubscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    toast.success('This is a demo feature. In a real app, this would redirect to a payment processor');
    toast('Subscription feature coming soon!', {
      description: 'Direct contact with caregivers will be available in a future update.',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">Choose a Subscription Plan</DialogTitle>
          <DialogDescription className="text-center max-w-2xl mx-auto">
            Unlock direct contact with caregivers by choosing one of our subscription plans. 
            {professional && ` To contact ${professional.full_name || 'this caregiver'}, you'll need an active subscription.`}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''} ${plan.isPopular ? 'shadow-lg' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.recommendedFor}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/{plan.billingPeriod}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={selectedPlan === plan.id ? "default" : "outline"} 
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} disabled={!selectedPlan}>
            Subscribe Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
