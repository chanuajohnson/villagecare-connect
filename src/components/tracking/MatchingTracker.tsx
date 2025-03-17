
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";

interface MatchingTrackerProps {
  /**
   * The type of matching page being tracked
   */
  matchingType: 'family' | 'caregiver';
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
}

/**
 * Component to track matching page visits
 */
export const MatchingTracker = ({ matchingType, additionalData = {} }: MatchingTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  
  useEffect(() => {
    const trackMatchingPageView = async () => {
      try {
        const actionType = `${matchingType}_matching_page_view`;
        
        await trackEngagement(actionType as any, {
          ...additionalData,
          user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out',
        });
      } catch (error) {
        console.error(`Error tracking matching page view for ${matchingType}:`, error);
        // Continue execution even if tracking fails
      }
    };
    
    let isMounted = true;
    if (user && isMounted) {
      trackMatchingPageView();
    }
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingType, user?.id]); // Retrack if user ID changes
  
  return null; // This component doesn't render anything
};
