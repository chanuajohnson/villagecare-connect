import React from 'react';
import { UserJourneyTracker } from './UserJourneyTracker';
import { PageViewTracker } from './PageViewTracker';
import { DashboardTracker } from './DashboardTracker';

/**
 * Example component demonstrating how to use various trackers
 * This is for demonstration purposes only and should not be used directly
 */
export const JourneyTrackingExample = () => {
  // This component is just an example of how to use the trackers
  // in different parts of your application
  
  return (
    <div>
      {/* Track landing page with journey stage */}
      <PageViewTracker 
        pageName="Landing Page"
        actionType="landing_page_view"
        journeyStage="discovery" 
      >
        <div>Page content would go here</div>
      </PageViewTracker>
      
      {/* For tracking specific journey stages (key user actions) */}
      <UserJourneyTracker 
        stage="feature_discovery"
        feature="caregiver_matching"
        component="feature_overview"
        additionalData={{ feature: "caregiver_matching" }}
      >
        <div>Feature content would go here</div>
      </UserJourneyTracker>
      
      {/* For tracking first-time experiences (only once per session) */}
      <UserJourneyTracker 
        stage="first_login_experience"
        feature="onboarding"
        component="welcome_screen"
        trackOnce={true}
      >
        <div>First-time experience content would go here</div>
      </UserJourneyTracker>
      
      {/* For dashboard visits with user context */}
      <DashboardTracker dashboardType="professional">
        <div>Dashboard content would go here</div>
      </DashboardTracker>
      
      {/* Other components would go here */}
    </div>
  );
};

/**
 * EXAMPLES OF JOURNEY STAGE TRACKING IN DIFFERENT COMPONENTS:
 * 
 * 1. On landing page:
 * <UserJourneyTracker stage="first_visit" feature="landing_page" component="hero_section" />
 * 
 * 2. On signup page:
 * <UserJourneyTracker stage="authentication" feature="signup" component="signup_form" />
 * 
 * 3. On first profile creation:
 * <UserJourneyTracker stage="profile_creation" feature="onboarding" component="profile_form" />
 * 
 * 4. On features page:
 * <UserJourneyTracker stage="feature_discovery" feature="feature_overview" component="feature_grid" />
 * 
 * 5. On matching page:
 * <UserJourneyTracker stage="matching_exploration" feature="caregiver_matching" component="matching_results" />
 * 
 * 6. On subscription page:
 * <UserJourneyTracker stage="subscription_consideration" feature="premium_features" component="pricing_cards" />
 * 
 * 7. On successful subscription:
 * <UserJourneyTracker stage="subscription_conversion" feature="checkout" component="success_page" />
 * 
 * 8. For returning users:
 * <UserJourneyTracker stage="return_visit" feature="dashboard" component="welcome_back" />
 */
