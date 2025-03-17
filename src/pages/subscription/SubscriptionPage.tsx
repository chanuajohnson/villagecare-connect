
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { useTracking } from "@/hooks/useTracking";

// Type for subscription plan features
interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
}

// Type for subscription plans
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: PlanFeature[];
  popular?: boolean;
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { trackEngagement } = useTracking();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const returnPath = location.state?.returnPath || 
    (userRole === 'family' ? "/dashboard/family" : "/dashboard/professional");
  const featureType = location.state?.featureType || "premium feature";
  
  const breadcrumbItems = [
    { label: "Dashboard", path: returnPath.split('/').slice(0, 3).join('/') },
    { label: "Subscription", path: "/subscription" },
  ];

  // Fetch subscription plans from the database
  useEffect(() => {
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

        // Process the plans data to add UI-specific properties
        const processedPlans = data.map(plan => {
          // Determine if the plan should be marked as popular (the highest non-zero price for each user type)
          const planType = plan.name.toLowerCase().includes('family') ? 'family' : 'caregiver';
          const isPopular = plan.price > 0 && !plan.name.toLowerCase().includes('enterprise');
          
          // Type assertion to convert the JSON features to PlanFeature[] type
          const typedFeatures = (plan.features as unknown) as PlanFeature[];
          
          return {
            ...plan,
            features: typedFeatures,
            popular: isPopular,
            buttonColor: isPopular 
              ? "bg-primary-600 hover:bg-primary-700" 
              : "bg-primary hover:bg-primary/90"
          };
        });

        // Filter plans based on user role
        let filteredPlans = processedPlans;
        if (userRole === 'family') {
          filteredPlans = processedPlans.filter(plan => 
            plan.name.toLowerCase().includes('family')
          );
        } else if (userRole === 'professional') {
          filteredPlans = processedPlans.filter(plan => 
            plan.name.toLowerCase().includes('caregiver')
          );
        }

        setPlans(filteredPlans);
      } catch (error) {
        console.error('Error in fetchPlans:', error);
        toast.error('An error occurred while loading subscription options');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [userRole]);
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleSubscribe = async (planId: string) => {
    try {
      setProcessingPayment(true);
      
      // Track the subscription attempt
      await trackEngagement("subscription_attempt", {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name || '',
        feature_requested: featureType
      });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If we had actual payment integration, this is where it would go
      
      // For demo purposes, create a user subscription record directly
      if (user) {
        const now = new Date();
        const endDate = new Date();
        const plan = plans.find(p => p.id === planId);
        
        if (plan) {
          endDate.setDate(now.getDate() + plan.duration_days);
          
          const { error } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              plan_id: planId,
              start_date: now.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active'
            });
          
          if (error) {
            console.error('Error creating subscription:', error);
            throw new Error('Failed to create subscription');
          }
        }
      }
      
      const planName = plans.find(p => p.id === planId)?.name;
      toast.success(`Successfully subscribed to ${planName} plan!`);
      
      // Track successful subscription
      await trackEngagement("subscription_success", {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name || '',
        feature_requested: featureType
      });
      
      navigate(returnPath);
      
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
      
      // Track subscription failure
      await trackEngagement("subscription_failure", {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name || '',
        feature_requested: featureType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="subscription_page_view" 
        additionalData={{ feature_requested: featureType }}
        featureName="subscription"
      />
      
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Subscribe to Access Premium Features</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
          
          <p className="text-lg text-gray-600">
            You've tried to access: <span className="font-medium">{featureType}</span>
          </p>
          
          <p className="text-gray-600">
            Subscribe to one of our plans below to unlock this and other premium features. Choose the plan that best fits your needs.
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading subscription plans...</p>
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">No plans available</h3>
              <p className="text-yellow-700">
                We couldn't find any subscription plans for your user type. Please contact support for assistance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`border-2 ${selectedPlan === plan.id ? 'border-primary' : 'border-border'} ${
                    plan.popular ? 'relative shadow-lg' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 right-4 bg-primary">Most Popular</Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">
                        {plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                          )}
                          <div>
                            <p className={feature.included ? "text-gray-700 font-medium" : "text-gray-400"}>
                              {feature.name}
                            </p>
                            <p className={`text-xs ${feature.included ? "text-gray-600" : "text-gray-400"}`}>
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={processingPayment}
                    >
                      {processingPayment && selectedPlan === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : plan.price === 0 ? (
                        `Continue with ${plan.name}`
                      ) : (
                        `Subscribe to ${plan.name}`
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h3 className="font-medium text-lg">Payment Options</h3>
            <p className="text-gray-600 mt-2">
              We accept all major credit cards as well as PayPal. For enterprise plans, we also offer invoice payments.
              All payments are securely processed and your information is never stored on our servers.
            </p>
            <div className="flex gap-4 mt-4">
              <div className="bg-white p-2 rounded">
                <img src="https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_1280.png" alt="PayPal" className="h-8" />
              </div>
              <div className="bg-white p-2 rounded">
                <img src="https://cdn.pixabay.com/photo/2021/12/08/05/16/visa-6855535_1280.png" alt="Visa" className="h-8" />
              </div>
              <div className="bg-white p-2 rounded">
                <img src="https://cdn.pixabay.com/photo/2015/09/15/18/17/mastercard-941393_1280.jpg" alt="Mastercard" className="h-8" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
