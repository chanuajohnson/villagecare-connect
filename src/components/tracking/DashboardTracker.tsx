
import { useTracking } from "@/hooks/useTracking";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardTrackerProps {
  /**
   * The type of dashboard being tracked
   */
  dashboardType: 'family' | 'professional' | 'community' | 'admin';
}

/**
 * Component to track dashboard visits with user context
 */
export const DashboardTracker = ({ dashboardType }: DashboardTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  
  useEffect(() => {
    let isMounted = true;
    
    const trackDashboardView = async () => {
      if (!isMounted) return;
      
      try {
        const actionType = `${dashboardType}_dashboard_view`;
        
        await trackEngagement(actionType as any, {
          user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out',
          path: window.location.pathname,
        });
      } catch (error) {
        console.error(`Error tracking dashboard view for ${dashboardType}:`, error);
        // Continue execution even if tracking fails
      }
    };
    
    if (isMounted && user) {
      trackDashboardView();
    }
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, user?.id]); // Retrack if user ID changes
  
  return null; // This component doesn't render anything
};
