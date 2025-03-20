
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
}

/**
 * Component to track user journey stages and feature engagement
 */
export const UserJourneyTracker = ({
  stage,
  feature,
  component,
  additionalData = {},
  children
}: UserJourneyTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user } = useAuth();
  const hasTracked = useRef(false);
  
  // Track the component view once when mounted
  useEffect(() => {
    // Only track once per component instance
    if (hasTracked.current) return;
    
    const trackJourneyStage = async () => {
      try {
        hasTracked.current = true;
        
        await trackEngagement('journey_stage_view', {
          stage,
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
  }, [stage, feature, component, user, trackEngagement, additionalData]);
  
  return <>{children}</>; // Render children
};
