
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

// Define the feature interface
interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
}

// Define the plan interface
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  features: PlanFeature[];
  buttonText: string;
  mostPopular?: boolean;
}

export default function SubscriptionFeaturesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { returnPath, referringPagePath, referringPageLabel, featureType } = location.state || {};
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);

  // Default dashboard path based on user role if not provided
  const defaultDashboardPath = user?.role === 'family' 
    ? '/dashboard/family' 
    : user?.role === 'professional' 
      ? '/dashboard/professional'
      : '/';
  
  const defaultDashboardLabel = user?.role === 'family' 
    ? 'Family Dashboard' 
    : user?.role === 'professional' 
      ? 'Professional Dashboard'
      : 'Home';

  // Use provided paths or fallback to defaults - giving priority to explicit referringPagePath
  const dashboardPath = referringPagePath || returnPath || defaultDashboardPath;
  const dashboardLabel = referringPageLabel || defaultDashboardLabel;

  useEffect(() => {
    // Set the selected user type based on multiple factors with more accurate detection
    if (user?.role) {
      // If user has a role, use that as the primary source of truth
      setSelectedUserType(user.role);
    } else if (
      // Check if coming from family dashboard or family-specific pages
      dashboardPath.includes('/dashboard/family') || 
      dashboardPath.includes('/family/') ||
      referringPagePath?.includes('/dashboard/family') || 
      referringPagePath?.includes('/family/')
    ) {
      setSelectedUserType('family');
    } else if (
      // Check if coming from professional dashboard or professional-specific pages
      dashboardPath.includes('/dashboard/professional') || 
      dashboardPath.includes('/professional/') ||
      referringPagePath?.includes('/dashboard/professional') || 
      referringPagePath?.includes('/professional/')
    ) {
      setSelectedUserType('professional');
    } else {
      // If no context is available, check the current URL path for additional context
      const currentPath = window.location.pathname;
      if (currentPath.includes('/family/') || location.search.includes('type=family')) {
        setSelectedUserType('family');
      } else if (currentPath.includes('/professional/') || location.search.includes('type=professional')) {
        setSelectedUserType('professional');
      } else {
        // Default to family if no context is available
        setSelectedUserType('family');
      }
    }

    console.log("Subscription features page context:", { 
      returnPath, 
      referringPagePath, 
      referringPageLabel, 
      dashboardPath, 
      dashboardLabel,
      userRole: user?.role,
      locationState: location.state,
      selectedUserType
    });
  }, [returnPath, referringPagePath, referringPageLabel, dashboardPath, dashboardLabel, user?.role, location.state, location.search]);

  // Define the family subscription plans
  const familyPlans: SubscriptionPlan[] = [
    {
      id: 'family-basic',
      name: 'Family Basic',
      description: 'Essential tools for families needing support',
      price: 'Free',
      features: [
        { name: 'Care Network Building', description: 'Create your support network', included: true },
        { name: 'Basic Care Calendar', description: 'Schedule and organize care needs', included: true },
        { name: 'Community Forum Access', description: 'Connect with other families', included: true },
        { name: 'Resource Library', description: 'Access to basic support materials', included: true },
        { name: 'Limited Caregiver Matching', description: 'Basic matching with caregivers', included: true },
        { name: 'Advanced Matching Features', description: 'Preferred caregiver matching', included: false },
        { name: 'Meal Planning Tools', description: 'Comprehensive meal planning support', included: false },
        { name: 'Priority Support', description: '24/7 priority support access', included: false },
      ],
      buttonText: 'Get Started'
    },
    {
      id: 'family-premium',
      name: 'Family Premium',
      description: 'Comprehensive care coordination and support',
      price: '$9.99/month',
      features: [
        { name: 'Care Network Building', description: 'Create your support network', included: true },
        { name: 'Advanced Care Calendar', description: 'Enhanced scheduling and organizing', included: true },
        { name: 'Community Forum Access', description: 'Connect with other families', included: true },
        { name: 'Full Resource Library', description: 'Access to all support materials', included: true },
        { name: 'Advanced Caregiver Matching', description: 'Priority matching with caregivers', included: true },
        { name: 'Meal Planning & Shopping Lists', description: 'Comprehensive meal planning', included: true },
        { name: 'Care Coordination Tools', description: 'Coordinate across your care network', included: true },
        { name: 'Priority Support', description: '24/7 priority support access', included: true },
      ],
      buttonText: 'Upgrade Now',
      mostPopular: true
    }
  ];

  // Define the caregiver subscription plans
  const caregiverPlans: SubscriptionPlan[] = [
    {
      id: 'caregiver-basic',
      name: 'Caregiver Basic',
      description: 'Essential tools for caregivers',
      price: 'Free',
      features: [
        { name: 'Basic Profile Creation', description: 'Create your professional profile', included: true },
        { name: 'Family Matching', description: 'Connect with families needing care', included: true },
        { name: 'Basic Training Resources', description: 'Access to fundamental training', included: true },
        { name: 'Community Forum Access', description: 'Connect with other caregivers', included: true },
        { name: 'Availability Calendar', description: 'Manage your availability', included: true },
        { name: 'Advanced Search Features', description: 'Find perfect family matches', included: false },
        { name: 'Professional Certification', description: 'Showcase your certifications', included: false },
        { name: 'Priority Family Matching', description: 'Get priority in matching algorithm', included: false },
      ],
      buttonText: 'Get Started'
    },
    {
      id: 'caregiver-premium',
      name: 'Caregiver Premium',
      description: 'Advanced tools to enhance your caregiving practice',
      price: '$7.99/month',
      features: [
        { name: 'Enhanced Profile Creation', description: 'Create detailed professional profile', included: true },
        { name: 'Priority Family Matching', description: 'Top placement in family searches', included: true },
        { name: 'Full Training Library', description: 'Access all professional training', included: true },
        { name: 'Certification Display', description: 'Showcase your certifications', included: true },
        { name: 'Advanced Calendar Tools', description: 'Sophisticated availability management', included: true },
        { name: 'Client Communication Tools', description: 'Dedicated messaging system', included: true },
        { name: 'Professional Development', description: 'Access to continuing education', included: true },
        { name: 'Priority Support', description: '24/7 priority support access', included: true },
      ],
      buttonText: 'Upgrade Now',
      mostPopular: true
    }
  ];

  // Handle subscription button click
  const handleSubscription = (plan: SubscriptionPlan) => {
    // For demonstration purposes, just show a toast notification
    toast({
      title: `${plan.name} Selected`,
      description: `You've selected the ${plan.name} plan. This would normally proceed to payment processing.`,
      duration: 5000,
    });

    // Navigate back after a short delay
    setTimeout(() => {
      if (dashboardPath) {
        navigate(dashboardPath, { state: { from: 'subscription', planSelected: plan.id } });
      }
    }, 1500);
  };

  // Determine which plans to display based on selected user type
  const displayPlans = selectedUserType === 'family' ? familyPlans : caregiverPlans;

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {/* Always show the dashboard breadcrumb item, but ensure it's not "Home" again */}
            {dashboardPath && dashboardPath !== "/" && (
              <BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <Link to={dashboardPath}>{dashboardLabel !== "Home" ? dashboardLabel : "Dashboard"}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Subscription</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">
        {featureType ? `Unlock ${featureType}` : 'Subscription Plans'}
      </h1>

      {featureType && (
        <div className="mt-4 mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-800">
            You're viewing subscription options to unlock <strong>{featureType}</strong>.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {displayPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${plan.mostPopular ? 'border-primary ring-2 ring-primary' : ''}`}
          >
            {plan.mostPopular && (
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price !== 'Free' && <span className="text-muted-foreground ml-1">/month</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className={`mr-2 mt-1 ${feature.included ? 'text-green-500' : 'text-gray-300'}`}>
                      <Check size={16} />
                    </span>
                    <div>
                      <p className={`font-medium ${!feature.included && 'text-muted-foreground'}`}>
                        {feature.name}
                      </p>
                      <p className={`text-sm ${!feature.included && 'text-muted-foreground'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscription(plan)} 
                className="w-full"
                variant={plan.mostPopular ? "default" : "outline"}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button 
          variant="ghost" 
          onClick={() => {
            if (dashboardPath) {
              navigate(dashboardPath, { state: { from: 'subscription' } });
            } else {
              navigate('/');
            }
          }}
        >
          {dashboardPath ? 'Go Back' : 'Go Home'}
        </Button>
      </div>
    </div>
  );
}
