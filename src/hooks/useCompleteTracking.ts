
import { useTracking, TrackingActionType } from "./useTracking";
import { UserJourneyStage } from "@/components/tracking/UserJourneyTracker";

/**
 * Hook that provides a unified tracking interface for combining 
 * page views, user journey stages, and other engagement metrics
 */
export const useCompleteTracking = () => {
  const { trackEngagement, isLoading } = useTracking();
  
  /**
   * Track a complete user interaction with journey context
   * 
   * @param actionType The type of action being tracked
   * @param journeyStage The current stage in the user journey
   * @param additionalData Optional additional data to include
   */
  const trackWithJourney = async (
    actionType: TrackingActionType, 
    journeyStage: UserJourneyStage,
    additionalData: Record<string, any> = {}
  ) => {
    // First, track the specific action
    await trackEngagement(actionType, {
      ...additionalData,
      journey_stage: journeyStage,
      timestamp: new Date().toISOString()
    });
    
    // Then, track the journey progress
    await trackEngagement("user_journey_progress", {
      journey_stage: journeyStage,
      trigger_action: actionType,
      ...additionalData,
      timestamp: new Date().toISOString()
    });
  };
  
  /**
   * Track a feature interaction with journey context
   * 
   * @param featureName The name of the feature being interacted with
   * @param interactionType The type of interaction (view, click, etc)
   * @param journeyStage The current stage in the user journey
   * @param additionalData Optional additional data to include
   */
  const trackFeatureWithJourney = async (
    featureName: string,
    interactionType: "view" | "click" | "complete" | "start" | string,
    journeyStage: UserJourneyStage,
    additionalData: Record<string, any> = {}
  ) => {
    const actionType = `feature_${featureName}_${interactionType}` as TrackingActionType;
    
    await trackWithJourney(actionType, journeyStage, {
      feature_name: featureName,
      interaction_type: interactionType,
      ...additionalData
    });
  };
  
  return {
    trackWithJourney,
    trackFeatureWithJourney,
    trackEngagement, // Original tracking function for backward compatibility
    isLoading
  };
};
