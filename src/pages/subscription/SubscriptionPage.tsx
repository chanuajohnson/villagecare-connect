
import React, { useState } from "react";
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
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Get the return path from state or default to dashboard
  const returnPath = location.state?.returnPath || "/dashboard/professional";
  const featureType = location.state?.featureType || "premium feature";
  
  const breadcrumbItems = [
    { label: "Dashboard", href: returnPath.split('/').slice(0, 3).join('/') },
    { label: "Subscription", href: "/subscription" },
  ];
  
  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$9.99",
      period: "monthly",
      description: "Essential access for casual users",
      features: [
        { name: "View job postings", included: true },
        { name: "Basic message board access", included: true },
        { name: "View 5 professional profiles", included: true },
        { name: "Email support", included: true },
        { name: "Real-time notifications", included: false },
        { name: "Priority application submission", included: false },
        { name: "Advanced filtering", included: false },
        { name: "Unlimited profile views", included: false },
      ],
      popular: false,
      buttonColor: "bg-primary hover:bg-primary/90"
    },
    {
      id: "premium",
      name: "Premium",
      price: "$19.99",
      period: "monthly",
      description: "Enhanced features for active users",
      features: [
        { name: "View job postings", included: true },
        { name: "Basic message board access", included: true },
        { name: "View 5 professional profiles", included: true },
        { name: "Email support", included: true },
        { name: "Real-time notifications", included: true },
        { name: "Priority application submission", included: true },
        { name: "Advanced filtering", included: true },
        { name: "Unlimited profile views", included: false },
      ],
      popular: true,
      buttonColor: "bg-primary-600 hover:bg-primary-700"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$39.99",
      period: "monthly",
      description: "Complete access for power users",
      features: [
        { name: "View job postings", included: true },
        { name: "Basic message board access", included: true },
        { name: "View 5 professional profiles", included: true },
        { name: "Email support", included: true },
        { name: "Real-time notifications", included: true },
        { name: "Priority application submission", included: true },
        { name: "Advanced filtering", included: true },
        { name: "Unlimited profile views", included: true },
      ],
      popular: false,
      buttonColor: "bg-primary hover:bg-primary/90"
    }
  ];
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleSubscribe = async (planId: string) => {
    try {
      setProcessingPayment(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully subscribed to ${plans.find(p => p.id === planId)?.name} plan!`);
      
      // For demo purposes, we'll navigate back to the original page
      // In a real implementation, this would process payment and then navigate
      navigate(returnPath);
      
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
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
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
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
                    disabled={processingPayment}
                  >
                    {processingPayment && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      `Subscribe to ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h3 className="font-medium text-lg">Payment Options</h3>
            <p className="text-gray-600 mt-2">
              We accept all major credit cards as well as PayPal. For enterprise plans, we also offer invoice payments.
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
