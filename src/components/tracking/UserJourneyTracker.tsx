
import { useTracking } from "@/hooks/useTracking";
import { useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export interface UserJourneyTrackerProps {
  /**
   * The stage of the user journey being tracked
   */
  stage: string;
  
  /**
   * The feature being tracked
   */
  feature: string;
  
  /**
   * The component or section where the tracker is used
   */
  component: string;
  
  /**
   * Additional tracking data to include
   */
  additionalData?: Record<string, any>;
  
  /**
   * Children components to be rendered
   */
  children: ReactNode;

  /**
   * For backwards compatibility with older usage
   */
  journeyStage?: string;

  /**
   * Whether to track only once per session
   */
  trackOnce?: boolean;
}

/**
 * Component to track user journey stages and feature engagement
 */
export const UserJourneyTracker = ({
  stage,
  feature,
  component,
  additionalData = {},
  children,
  journeyStage, // For backwards compatibility
  trackOnce = false
}: UserJourneyTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user } = useAuth();
  const hasTracked = useRef(false);
  const [sessionTracked, setSessionTracked] = useState(false);
  
  // Track the component view once when mounted
  useEffect(() => {
    // Handle backwards compatibility
    const effectiveStage = journeyStage || stage;
    
    // Check if we already tracked in this session and trackOnce is true
    if (trackOnce) {
      const sessionKey = `tracked_journey_${effectiveStage}_${feature || component}`;
      const alreadyTracked = sessionStorage.getItem(sessionKey) === 'true';
      
      if (alreadyTracked || sessionTracked) {
        return;
      }
      
      setSessionTracked(true);
      sessionStorage.setItem(sessionKey, 'true');
    } else if (hasTracked.current) {
      // Only track once per component instance if not using trackOnce
      return;
    }
    
    const trackJourneyStage = async () => {
      try {
        hasTracked.current = true;
        
        await trackEngagement('journey_stage_view', {
          stage: effectiveStage,
          feature,
          component,
          user_id: user?.id || 'anonymous',
          has_account: !!user,
          ...additionalData,
        });
      } catch (error) {
        console.error('Error tracking journey stage:', error);
        // Continue even if tracking fails
      }
    };
    
    trackJourneyStage();
  }, [stage, feature, component, user, trackEngagement, additionalData, journeyStage, trackOnce, sessionTracked]);
  
  return <>{children}</>; // Render children
};
