
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
import { CheckCircle2, AlertCircle, ArrowLeft, Crown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTracking } from "@/hooks/useTracking";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const { trackEngagement } = useTracking();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Get context from location state with fallbacks
  const returnPath = location.state?.returnPath || (userRole === 'professional' ? "/dashboard/professional" : "/dashboard/family");
  const featureType = location.state?.featureType || "premium feature";
  const referringPagePath = location.state?.referringPagePath || returnPath;
  const referringPageLabel = location.state?.referringPageLabel || "Dashboard";
  
  // Mock current subscription for demo purposes (in real app, fetch from user profile)
  const currentPlan = "basic";
  
  // Set up breadcrumb items based on referring page
  const breadcrumbItems = [
    { label: "Dashboard", path: referringPagePath.split('/').slice(0, 3).join('/') },
    { label: referringPageLabel !== "Dashboard" ? referringPageLabel : "Family Dashboard", path: referringPagePath },
    { label: "Subscription", path: "/subscription" },
  ];
  
  // Filter plans based on user role or show all plans if not logged in
  const getUserSpecificPlans = () => {
    // For family users or when accessed from family dashboard
    if (!user || userRole === 'family' || referringPagePath.includes('family')) {
      return familyPlans;
    }
    
    // For professional users
    if (userRole === 'professional' || referringPagePath.includes('professional')) {
      return professionalPlans;
    }
    
    // Default fallback to show all plans
    return familyPlans;
  };
  
  const familyPlans = [
    {
      id: "basic",
      name: "Family Basic",
      price: "Free",
      period: "",
      description: "Limited access to essential family features",
      features: [
        { name: "View 3 caregiver profiles per day", included: true },
        { name: "Basic message board access (read-only)", included: true },
        { name: "Limited job posting (1 active)", included: true },
        { name: "Email support", included: true },
        { name: "Post care need requests", included: false },
        { name: "View full caregiver profiles", included: false },
        { name: "Unlimited caregiver matching", included: false },
        { name: "Priority support", included: false },
      ],
      popular: false,
      buttonColor: "bg-muted text-muted-foreground hover:bg-muted/90",
      buttonText: "Current Plan"
    },
    {
      id: "care",
      name: "Family Care",
      price: "$14.99",
      period: "monthly",
      description: "Enhanced features for active caregiving families",
      features: [
        { name: "View 3 caregiver profiles per day", included: true },
        { name: "Basic message board access (read-only)", included: true },
        { name: "Limited job posting (1 active)", included: true },
        { name: "Email support", included: true },
        { name: "Post care need requests", included: true },
        { name: "View full caregiver profiles", included: true },
        { name: "Unlimited caregiver matching", included: false },
        { name: "Priority support", included: false },
      ],
      popular: true,
      buttonColor: "bg-primary hover:bg-primary/90",
      buttonText: "Upgrade to Care"
    },
    {
      id: "premium",
      name: "Family Premium",
      price: "$29.99",
      period: "monthly",
      description: "Complete access for families with ongoing care needs",
      features: [
        { name: "View 3 caregiver profiles per day", included: true },
        { name: "Basic message board access (read-only)", included: true },
        { name: "Limited job posting (1 active)", included: true },
        { name: "Email support", included: true },
        { name: "Post care need requests", included: true },
        { name: "View full caregiver profiles", included: true },
        { name: "Unlimited caregiver matching", included: true },
        { name: "Priority support", included: true },
      ],
      popular: false,
      buttonColor: "bg-primary hover:bg-primary/90",
      buttonText: "Upgrade to Premium"
    }
  ];
  
  const professionalPlans = [
    {
      id: "basic",
      name: "Professional Basic",
      price: "Free",
      period: "",
      description: "Limited access for casual professionals",
      features: [
        { name: "Apply for 3 jobs per week", included: true },
        { name: "Basic profile listing", included: true },
        { name: "Limited training resources", included: true },
        { name: "Email support", included: true },
        { name: "Featured profile placement", included: false },
        { name: "Unlimited job applications", included: false },
        { name: "Advanced training resources", included: false },
        { name: "Priority job matching", included: false },
      ],
      popular: false,
      buttonColor: "bg-muted text-muted-foreground hover:bg-muted/90",
      buttonText: "Current Plan"
    },
    {
      id: "pro",
      name: "Professional Pro",
      price: "$19.99",
      period: "monthly",
      description: "Enhanced features for active professionals",
      features: [
        { name: "Apply for 3 jobs per week", included: true },
        { name: "Basic profile listing", included: true },
        { name: "Limited training resources", included: true },
        { name: "Email support", included: true },
        { name: "Featured profile placement", included: true },
        { name: "Unlimited job applications", included: true },
        { name: "Advanced training resources", included: false },
        { name: "Priority job matching", included: false },
      ],
      popular: true,
      buttonColor: "bg-primary hover:bg-primary/90",
      buttonText: "Upgrade to Pro"
    },
    {
      id: "expert",
      name: "Professional Expert",
      price: "$34.99",
      period: "monthly",
      description: "Complete access for dedicated care professionals",
      features: [
        { name: "Apply for 3 jobs per week", included: true },
        { name: "Basic profile listing", included: true },
        { name: "Limited training resources", included: true },
        { name: "Email support", included: true },
        { name: "Featured profile placement", included: true },
        { name: "Unlimited job applications", included: true },
        { name: "Advanced training resources", included: true },
        { name: "Priority job matching", included: true },
      ],
      popular: false,
      buttonColor: "bg-primary hover:bg-primary/90",
      buttonText: "Upgrade to Expert"
    }
  ];
  
  // Get the appropriate plans based on user role and context
  const plans = getUserSpecificPlans();
  
  const handleSubscribe = async (planId: string) => {
    try {
      setSelectedPlan(planId);
      setProcessingPayment(true);
      
      // Track the subscription event for admin analytics
      await trackEngagement('subscription_plan_selected', {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name,
        feature_accessed: featureType,
        referring_page: referringPagePath,
        user_role: userRole || 'anonymous'
      });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get plan name for the toast message
      const planName = plans.find(p => p.id === planId)?.name;
      
      // Show success message with improved payment clarification
      toast.success(
        `Successfully subscribed to ${planName} plan! (Demo only: No payment has been processed. When launched, an email with payment details will be sent to complete your subscription.)`
      );
      
      // Track successful subscription for admin analytics
      await trackEngagement('subscription_completed', {
        plan_id: planId,
        plan_name: planName,
        feature_accessed: featureType,
        price: plans.find(p => p.id === planId)?.price
      });
      
      // Determine the correct dashboard path based on user role
      const dashboardPath = userRole === 'professional' 
        ? '/dashboard/professional'
        : '/dashboard/family';
      
      // Navigate back to the original feature they were trying to access or the appropriate dashboard
      navigate(returnPath || dashboardPath, { 
        state: { 
          from: 'subscription',
          subscriptionComplete: true,
          newPlan: planId 
        } 
      });
      
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
      
      // Track failed subscription for admin analytics
      await trackEngagement('subscription_failed', {
        plan_id: planId,
        plan_name: plans.find(p => p.id === planId)?.name,
        feature_accessed: featureType,
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
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Subscribe to Access Premium Features</h1>
              {featureType && (
                <p className="text-lg text-primary mt-2">
                  <span className="font-medium">Feature: {featureType}</span>
                </p>
              )}
            </div>
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
          
          <div className="bg-muted/30 border p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Unlock {featureType}</h3>
                <p className="text-muted-foreground">
                  Choose the plan that best fits your needs to access this premium feature and more.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`border-2 ${plan.id === currentPlan ? 'border-primary/30 bg-primary/5' : selectedPlan === plan.id ? 'border-primary' : 'border-border'} ${
                  plan.popular ? 'relative shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 right-4 bg-primary">Most Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">/{plan.period}</span>}
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
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.buttonColor}`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPayment || plan.id === currentPlan}
                  >
                    {processingPayment && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h3 className="font-medium text-lg">Payment Options</h3>
            <p className="text-gray-600 mt-2">
              We accept all major credit cards as well as PayPal. For premium plans, we also offer invoice payments.
              All payments are securely processed and your information is never stored on our servers.
            </p>
            <div className="flex gap-4 mt-4">
              <img src="https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_1280.png" alt="PayPal" className="h-8" />
              <img src="https://cdn.pixabay.com/photo/2021/12/08/05/16/visa-6855535_1280.png" alt="Visa" className="h-8" />
              <img src="https://cdn.pixabay.com/photo/2015/09/15/18/17/mastercard-941393_1280.jpg" alt="Mastercard" className="h-8" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
