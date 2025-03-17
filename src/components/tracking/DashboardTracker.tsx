
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
      const actionType = `${dashboardType}_dashboard_view`;
      
      await trackEngagement(actionType as any, {
        ...additionalData,
        user_status: user ? (isProfileComplete ? 'complete_profile' : 'incomplete_profile') : 'logged_out',
        path: window.location.pathname,
        referrer: document.referrer,
        time_of_day: new Date().getHours()
      });
    };
    
    trackDashboardView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, user?.id]); // Retrack if user ID changes
  
  return null; // This component doesn't render anything
};
