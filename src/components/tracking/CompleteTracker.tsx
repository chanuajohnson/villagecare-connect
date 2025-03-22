
import { ReactNode } from "react";
import { PageViewTracker } from "./PageViewTracker";
import { UserJourneyTracker, UserJourneyStage } from "./UserJourneyTracker";
import { TrackingActionType } from "@/hooks/useTracking";

interface CompleteTrackerProps {
  /**
   * Page/view tracking configuration
   */
  pageTracking?: {
    actionType: TrackingActionType;
    additionalData?: Record<string, any>;
    trackPathChanges?: boolean;
  };

  /**
   * User journey tracking configuration
   */
  journeyTracking?: {
    journeyStage: UserJourneyStage;
    additionalData?: Record<string, any>;
    trackOnce?: boolean;
  };

  /**
   * Optional children to render with the tracker
   * Useful when adding tracking to specific components
   */
  children?: ReactNode;
}

/**
 * A comprehensive tracking component that combines different tracking mechanisms
 * 
 * Example usage:
 * ```tsx
 * // Basic page tracking with journey stage
 * <CompleteTracker 
 *   pageTracking={{ actionType: "dashboard_view" }}
 *   journeyTracking={{ journeyStage: "active_usage" }}
 * />
 * 
 * // Complex tracking with additional data
 * <CompleteTracker 
 *   pageTracking={{ 
 *     actionType: "caregiver_profile_view", 
 *     additionalData: { caregiver_id: caregiverId } 
 *   }}
 *   journeyTracking={{ 
 *     journeyStage: "matching_exploration", 
 *     additionalData: { interaction_type: "profile_view" },
 *     trackOnce: false
 *   }}
 * />
 * 
 * // Tracking around specific components
 * <CompleteTracker
 *   journeyTracking={{ journeyStage: "feature_discovery" }}
 * >
 *   <FeatureExplorer />
 * </CompleteTracker>
 * ```
 */
export const CompleteTracker = ({
  pageTracking,
  journeyTracking,
  children
}: CompleteTrackerProps) => {
  return (
    <>
      {/* Apply page view tracking if configured */}
      {pageTracking && (
        <PageViewTracker
          actionType={pageTracking.actionType}
          additionalData={{
            ...pageTracking.additionalData,
            // Add journey stage to page tracking for better correlation
            journey_stage: journeyTracking?.journeyStage || "navigation"
          }}
          trackPathChanges={pageTracking.trackPathChanges}
          journeyStage={journeyTracking?.journeyStage}
        />
      )}

      {/* Apply journey tracking if configured */}
      {journeyTracking && (
        <UserJourneyTracker
          journeyStage={journeyTracking.journeyStage}
          additionalData={{
            ...journeyTracking.additionalData,
            // Add page tracking context to journey data for better correlation
            page_action_type: pageTracking?.actionType
          }}
          trackOnce={journeyTracking.trackOnce}
        />
      )}

      {/* Render children if provided */}
      {children}
    </>
  );
};
