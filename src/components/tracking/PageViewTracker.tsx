
import { useEffect, useRef } from "react";
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
   * Optional feature name to categorize this tracking event
   */
  featureName?: string;
  
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
  featureName,
  trackPathChanges = false 
}: PageViewTrackerProps) => {
  const { trackEngagement } = useTracking({ rateLimit: 10000 }); // Higher rate limit for page views
  const location = useLocation();
  const hasTrackedInitialView = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);
  const trackingInProgress = useRef(false);
  
  useEffect(() => {
    // Only track the page view if:
    // 1. It's the initial view and we haven't tracked it yet, OR
    // 2. trackPathChanges is true and the path has changed from what we last tracked
    const currentPath = location.pathname + location.search;
    
    if (
      (!hasTrackedInitialView.current) || 
      (trackPathChanges && lastTrackedPath.current !== currentPath)
    ) {
      // If we're already tracking, don't start another tracking operation
      if (trackingInProgress.current) {
        console.log('[PageViewTracker] Tracking already in progress - skipping duplicate');
        return;
      }
      
      // Track the page view
      const trackPageView = async () => {
        try {
          trackingInProgress.current = true;
          
          console.log(`[PageViewTracker] Tracking page view: ${actionType} for ${currentPath}`);
          
          await trackEngagement(actionType, {
            ...additionalData,
            path: location.pathname,
            search: location.search,
            referrer: document.referrer,
          }, featureName);
          
          // Update tracking state
          hasTrackedInitialView.current = true;
          lastTrackedPath.current = currentPath;
        } catch (error) {
          console.error("[PageViewTracker] Error tracking page view:", error);
        } finally {
          // Reset tracking state after a short delay
          setTimeout(() => {
            trackingInProgress.current = false;
          }, 1000);
        }
      };
      
      trackPageView();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackPathChanges ? location.pathname + location.search : null]);
  
  return null; // This component doesn't render anything
};
