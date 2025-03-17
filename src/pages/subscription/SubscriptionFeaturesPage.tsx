import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbSimple } from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { v4 as uuidv4 } from "uuid";

export default function SubscriptionFeaturesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { returnPath, featureType, caregiverId, familyId } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Subscription",
      path: "/subscription"
    },
    {
      label: "Features",
      path: "/subscription-features"
    }
  ];
  
  const trackEngagement = async (actionType: string, additionalData = {}) => {
    try {
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      const { error } = await supabase.from('cta_engagement_tracking').insert({
        user_id: user?.id || null,
        action_type: actionType,
        session_id: sessionId,
        additional_data: additionalData
      });
      
      if (error) {
        console.error("Error tracking engagement:", error);
      }
    } catch (error) {
      console.error("Error in trackEngagement:", error);
    }
  };

  useEffect(() => {
    if (user) {
      trackEngagement('subscription_features_page_view', {
        returnPath: returnPath,
        featureType: featureType,
        caregiverId: caregiverId,
        familyId: familyId
      });
    }
  }, [user, returnPath, featureType, caregiverId, familyId]);
  
  const handleGoBack = () => {
    if (returnPath) {
      navigate(returnPath);
    } else {
      navigate("/subscription");
    }
  };
  
  const handleSubscribe = async () => {
    setIsLoading(true);
    
    if (featureType === "Premium Caregiver Profiles" && caregiverId) {
      await trackEngagement('subscribe_premium_caregiver_profile', { caregiver_id: caregiverId });
    }
    
    if (featureType === "Premium Family Profiles" && familyId) {
      await trackEngagement('subscribe_premium_family_profile', { family_id: familyId });
    }
    
    setTimeout(() => {
      setIsLoading(false);
      navigate("/subscription");
    }, 1500);
  };
  
  return (
    <div className="container px-4 py-8">
      <BreadcrumbSimple items={breadcrumbItems} />
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Unlock {featureType || "Premium Features"}</CardTitle>
          <CardDescription>
            Subscribe to unlock enhanced features and benefits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access to exclusive content</li>
            <li>Priority support</li>
            <li>Ad-free experience</li>
            <li>Enhanced matching algorithm</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
