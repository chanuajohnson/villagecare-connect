
import React from 'react';
import { UserJourneyTracker } from './UserJourneyTracker';
import { PageViewTracker } from './PageViewTracker';
import { DashboardTracker } from './DashboardTracker';
import { CompleteTracker } from './CompleteTracker';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useCompleteTracking } from '@/hooks/useCompleteTracking';

/**
 * Example component demonstrating how to use various trackers
 * This is for demonstration purposes only and should not be used directly
 */
export const JourneyTrackingExample = () => {
  const { trackWithJourney } = useCompleteTracking();
  
  const handleTrackingEvent = (eventType: string) => {
    trackWithJourney(
      `example_${eventType}_click`, 
      'feature_discovery',
      { 
        example_type: 'journey_tracking',
        source: 'tracking_example'
      }
    );
  };
  
  return (
    <div className="space-y-8">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTitle>Example Component</AlertTitle>
        <AlertDescription>
          This component demonstrates different tracking methods. For production use, 
          we recommend using the CompleteTracker or useCompleteTracking hook for a 
          more integrated experience.
        </AlertDescription>
      </Alert>
      
      {/* Legacy tracking methods (still functional) */}
      <div>
        {/* Track landing page with journey stage */}
        <PageViewTracker 
          actionType="landing_page_view"
          journeyStage="discovery" 
        />
        
        {/* For tracking specific journey stages (key user actions) */}
        <UserJourneyTracker 
          journeyStage="feature_discovery" 
          additionalData={{ feature: "caregiver_matching" }}
        />
        
        {/* For tracking first-time experiences (only once per session) */}
        <UserJourneyTracker 
          journeyStage="first_login_experience" 
          trackOnce={true}
        />
        
        {/* For dashboard visits with user context */}
        <DashboardTracker dashboardType="professional" />
      </div>
      
      {/* New integrated tracking methods (recommended) */}
      <Card>
        <CardHeader>
          <CardTitle>Integrated Tracking Methods</CardTitle>
          <CardDescription>
            The following examples show the new recommended ways to track user interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-base font-medium mb-2">1. Complete Tracker Component</h3>
            <pre className="p-3 bg-muted rounded-md text-sm overflow-auto">
{`// Simplified tracking with CompleteTracker (recommended)
<CompleteTracker
  pageTracking={{ 
    actionType: "family_dashboard_view"
  }}
  journeyTracking={{ 
    journeyStage: "active_usage" 
  }}
/>`}
            </pre>
            <Button 
              size="sm" 
              className="mt-2"
              onClick={() => handleTrackingEvent('complete_tracker')}
            >
              Try Complete Tracker
            </Button>
          </div>
          
          <div>
            <h3 className="text-base font-medium mb-2">2. Programmatic Tracking Hook</h3>
            <pre className="p-3 bg-muted rounded-md text-sm overflow-auto">
{`// useCompleteTracking hook (for programmatic tracking)
const { trackWithJourney } = useCompleteTracking();

// Track user actions with journey context
const handleSubscription = () => {
  trackWithJourney(
    'subscription_started',
    'conversion',
    { plan: 'premium' }
  );
};`}
            </pre>
            <Button 
              size="sm" 
              className="mt-2"
              onClick={() => handleTrackingEvent('tracking_hook')}
            >
              Try Tracking Hook
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Both methods save data to the same tracking table, making analysis easier.
          </p>
        </CardFooter>
      </Card>
      
      {/* CompleteTracker for this example component */}
      <CompleteTracker
        pageTracking={{
          actionType: "journey_tracking_example_view",
          additionalData: { context: "example" }
        }}
        journeyTracking={{
          journeyStage: "feature_discovery",
          additionalData: { feature: "tracking_system" }
        }}
      />
    </div>
  );
};

/**
 * EXAMPLES OF JOURNEY STAGE TRACKING ACROSS DIFFERENT PAGES:
 * 
 * 1. On landing page:
 * <CompleteTracker
 *   pageTracking={{ actionType: "landing_page_view" }}
 *   journeyTracking={{ journeyStage: "first_visit" }}
 * />
 * 
 * 2. On signup page:
 * <CompleteTracker
 *   pageTracking={{ actionType: "auth_signup_view" }}
 *   journeyTracking={{ journeyStage: "authentication" }}
 * />
 * 
 * 3. On profile creation:
 * <CompleteTracker
 *   pageTracking={{ actionType: "profile_creation_view" }}
 *   journeyTracking={{ journeyStage: "profile_creation" }}
 * />
 * 
 * 4. On features page:
 * <CompleteTracker
 *   pageTracking={{ actionType: "features_page_view" }}
 *   journeyTracking={{ journeyStage: "feature_discovery" }}
 * />
 * 
 * 5. On matching page:
 * <CompleteTracker
 *   pageTracking={{ actionType: "matching_page_view" }}
 *   journeyTracking={{ journeyStage: "matching_exploration" }}
 * />
 * 
 * 6. On subscription page:
 * <CompleteTracker
 *   pageTracking={{ actionType: "subscription_page_view" }}
 *   journeyTracking={{ journeyStage: "subscription_consideration" }}
 * />
 * 
 * 7. On successful subscription:
 * <CompleteTracker
 *   journeyTracking={{ journeyStage: "conversion" }}
 * />
 * 
 * 8. For returning users:
 * <CompleteTracker
 *   pageTracking={{ actionType: "dashboard_view" }}
 *   journeyTracking={{ journeyStage: "return_visit" }}
 * />
 */
