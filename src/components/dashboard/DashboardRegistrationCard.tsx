
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardRegistrationCardProps {
  /**
   * The type of user this registration card is for
   */
  userType: 'family' | 'professional' | 'community';
  
  /**
   * The text to display on the call-to-action button
   */
  ctaText: string;
  
  /**
   * The URL to navigate to when the CTA button is clicked
   */
  ctaLink: string;
  
  /**
   * Whether the card is currently loading profile data
   */
  isLoading?: boolean;
}

export const DashboardRegistrationCard = ({ 
  userType, 
  ctaText, 
  ctaLink, 
  isLoading = false 
}: DashboardRegistrationCardProps) => {
  const { user } = useAuth();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            {userType === 'professional' 
              ? 'Set up your professional profile to start connecting with families'
              : userType === 'family'
                ? 'Set up your family profile to find the perfect caregiver'
                : 'Complete your community profile to share resources'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to={ctaLink}>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : ctaText}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <UpvoteFeatureButton 
            featureTitle={`${userType.charAt(0).toUpperCase() + userType.slice(1)} Registration`} 
            className="w-full" 
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
