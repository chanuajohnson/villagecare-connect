
import { useEffect } from "react";
import { UserJourneyAnalytics } from "@/components/tracking/UserJourneyAnalytics";
import { useCompleteTracking } from "@/hooks/useCompleteTracking";

const JourneyAnalyticsPage = () => {
  const { trackWithJourney } = useCompleteTracking();
  
  useEffect(() => {
    // Track this admin page view with journey context
    trackWithJourney(
      "admin_journey_analytics_view",
      "active_usage",
      { section: "analytics", admin_feature: "user_journeys" }
    );
  }, [trackWithJourney]);
  
  return <UserJourneyAnalytics />;
};

export default JourneyAnalyticsPage;
