
import { useTracking } from "@/hooks/useTracking";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface DashboardTrackerProps {
  /**
   * The type of dashboard being tracked
   */
  dashboardType: 'family' | 'professional' | 'community' | 'admin';
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
}

/**
 * Component to track dashboard visits with user context
 */
export const DashboardTracker = ({ dashboardType, additionalData = {} }: DashboardTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user, isProfileComplete } = useAuth();
  
  useEffect(() => {
    const trackDashboardView = async () => {
      try {
        const actionType = `${dashboardType}_dashboard_view`;
        
        await trackEngagement(actionType as any, {
          ...additionalData,
          user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out',
          path: window.location.pathname,
          referrer: document.referrer,
          time_of_day: new Date().getHours()
        });
      } catch (error) {
        console.error(`Error tracking ${dashboardType} dashboard view:`, error);
        // Silent fail - don't block UI for tracking errors
      }
    };
    
    // Only try to track if user exists, and make it not block rendering
    if (user) {
      setTimeout(() => {
        trackDashboardView().catch(err => {
          console.error('Tracking failed but continuing:', err);
        });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, user?.id]); // Retrack if user ID changes
  
  return null; // This component doesn't render anything
};
