import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { Container } from "@/components/ui/container";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { DashboardRegistrationCard } from "@/components/dashboard/DashboardRegistrationCard";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { AdvancedMatchingCard } from "@/components/family/AdvancedMatchingCard";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [hasStory, setHasStory] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  useEffect(() => {
    async function checkProfile() {
      if (!user) return;
      
      try {
        setIsProfileLoading(true);
        
        // Check if user has completed their profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, care_types")
          .eq("id", user.id)
          .single();
        
        setHasProfile(Boolean(profileData?.full_name && profileData?.care_types?.length));
        
        // Check if user has created a care recipient story
        const { data: storyData, error: storyError } = await supabase
          .from("care_recipient_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        setHasStory(Boolean(storyData));
        
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    }
    
    checkProfile();
  }, [user]);
  
  return (
    <PageViewTracker pageName="family_dashboard">
      <DashboardTracker dashboardType="family">
        <Container>
          <DashboardHeader 
            title="Family Dashboard" 
            description="Manage care for your loved one and find support"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <FamilyNextStepsPanel />
            </div>
            {!hasProfile && (
              <DashboardRegistrationCard 
                userType="family"
                ctaText="Complete Your Profile"
                ctaLink="/registration/family"
                isLoading={isProfileLoading}
              />
            )}
            {hasProfile && !hasStory && (
              <TellTheirStoryCard />
            )}
            {hasProfile && hasStory && (
              <AdvancedMatchingCard />
            )}
          </div>
          
          <DashboardCardGrid>
            <CaregiverMatchingCard />
            {/* Other dashboard cards here */}
          </DashboardCardGrid>
        </Container>
      </DashboardTracker>
    </PageViewTracker>
  );
}
