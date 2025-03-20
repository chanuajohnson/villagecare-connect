
import { useEffect, useRef, ReactNode } from "react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";

export interface MatchingTrackerProps {
  /**
   * The type of match being tracked (e.g., 'advanced_family', 'basic_caregiver')
   */
  matchType: string;
  
  /**
   * The ID of the match being viewed
   */
  matchId: string;
  
  /**
   * The match score (percentage)
   */
  matchScore: number;
  
  /**
   * Additional data to track with the matching event
   */
  additionalData?: Record<string, any>;
  
  /**
   * Children components to be rendered
   */
  children: ReactNode;

  /**
   * For backwards compatibility - alias for matchType
   */
  matchingType?: string;
}

/**
 * Component to track matching-related interactions
 */
export const MatchingTracker = ({
  matchType,
  matchId,
  matchScore,
  additionalData = {},
  children,
  matchingType, // For backwards compatibility
}: MatchingTrackerProps) => {
  const { trackEngagement } = useTracking();
  const { user } = useAuth();
  const hasTracked = useRef(false);
  
  useEffect(() => {
    if (hasTracked.current) return;
    
    const trackMatchView = async () => {
      try {
        hasTracked.current = true;
        
        await trackEngagement('match_view', {
          match_type: matchingType || matchType,
          match_id: matchId,
          match_score: matchScore,
          user_id: user?.id || 'anonymous',
          timestamp: new Date().toISOString(),
          ...additionalData,
        });
      } catch (error) {
        console.error('Error tracking match view:', error);
        // Continue even if tracking fails
      }
    };
    
    trackMatchView();
  }, [matchType, matchId, matchScore, user, trackEngagement, additionalData, matchingType]);
  
  return <>{children}</>;
};
