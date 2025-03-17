
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";

interface PageViewTrackerProps {
  /**
   * The action type to use for tracking this page view
   */
  actionType: TrackingActionType;
  
  /**
   * Additional data to include with the tracking event
   */
  additionalData?: Record<string, any>;
  
  /**
   * If true, will re-track the page view on URL changes within the same page
   */
  trackPathChanges?: boolean;
}

/**
 * Component to track page views automatically
 */
export const PageViewTracker = ({ 
  actionType, 
  additionalData = {}, 
  trackPathChanges = false 
}: PageViewTrackerProps) => {
  const { trackEngagement } = useTracking();
  const location = useLocation();
  
  useEffect(() => {
    // Track the page view on mount
    const trackPageView = async () => {
      await trackEngagement(actionType, {
        ...additionalData,
        path: location.pathname,
        search: location.search,
        referrer: document.referrer,
      });
    };
    
    trackPageView();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackPathChanges ? location.pathname + location.search : null]);
  
  return null; // This component doesn't render anything
};
