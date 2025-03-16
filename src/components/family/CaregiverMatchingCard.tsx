
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const CaregiverMatchingCard = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // If user is logged in, don't show this card
  if (user) {
    return null;
  }

  const trackEngagement = async (actionType: string, additionalData = {}) => {
    try {
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      // Store the session ID if it's new
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

  const handleFindCaregiverClick = async () => {
    setIsLoading(true);
    
    try {
      // Track the CTA click
      await trackEngagement('caregiver_matching_cta_click', {
        source: 'family_dashboard',
        user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out'
      });
      
      // Determine redirect based on user status
      if (!user) {
        // User is not logged in
        toast.info("Please sign in to find your perfect caregiver match");
        navigate("/auth", { 
          state: { returnPath: "/caregiver-matching", action: "findCaregiver" }
        });
      } else if (!isProfileComplete) {
        // User is logged in but profile is incomplete
        toast.info("Let's complete your profile to find the perfect match");
        navigate("/registration/family", { 
          state: { returnPath: "/caregiver-matching", action: "findCaregiver" }
        });
      } else {
        // User is logged in and profile is complete
        toast.success("Finding your perfect caregiver matches");
        navigate("/caregiver-matching");
      }
    } catch (error) {
      console.error("Error in handleFindCaregiverClick:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 mb-8">
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100/30 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-semibold text-primary-900">Find the Right Caregiver in Minutes</CardTitle>
        </div>
        <CardDescription className="text-lg font-medium text-muted-foreground">
          Personalized Matching Based on Your Needs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ul className="space-y-2">
              {[
                "Get matched instantly with vetted caregivers.",
                "Compare caregiver profiles, pricing, and services.",
                "Message caregivers & book services directly.",
                "Peace of mind with background-checked professionals."
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-4 group"
              onClick={handleFindCaregiverClick}
              disabled={isLoading}
            >
              <span>Find Your Caregiver Now</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-primary-900 mb-2">Why Families Trust Us</h3>
            <p className="text-gray-600 mb-3">
              Our matching system considers over 20 compatibility factors to ensure you find the perfect caregiver for your unique situation.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">93%</span>
                <span className="text-gray-500">Match Satisfaction</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">48hrs</span>
                <span className="text-gray-500">Average Match Time</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">100%</span>
                <span className="text-gray-500">Verified Caregivers</span>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <span className="block text-xl font-bold text-primary-900">24/7</span>
                <span className="text-gray-500">Support Available</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
