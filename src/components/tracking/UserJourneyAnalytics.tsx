
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { UserJourneyMonitor } from "@/components/tracking/UserJourneyMonitor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";

export const UserJourneyAnalytics = () => {
  // Default to the specified user ID
  const [userId, setUserId] = useState("d18b867c-fd20-4b59-b355-846e0853eb8a");
  const [inputUserId, setInputUserId] = useState("");

  return (
    <Container className="py-8">
      {/* Track page view */}
      <PageViewTracker 
        actionType="admin_analytics_view" 
        additionalData={{ section: "user_journey" }}
        journeyStage="active_usage"
      />
      
      {/* Add general journey tracking for this analytics page */}
      <UserJourneyTracker 
        journeyStage="feature_discovery" 
        additionalData={{ feature: "journey_analytics" }}
      />
      
      <h1 className="text-3xl font-bold mb-6">User Journey Tracking System</h1>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>User Selection</CardTitle>
            <CardDescription>
              Enter a user ID to track their journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                placeholder="Enter user ID"
                className="flex-1"
              />
              <Button onClick={() => setUserId(inputUserId || "d18b867c-fd20-4b59-b355-846e0853eb8a")}>
                Track User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="monitor">
        <TabsList className="mb-4">
          <TabsTrigger value="monitor">User Journey Monitor</TabsTrigger>
          <TabsTrigger value="guide">Implementation Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monitor">
          <UserJourneyMonitor userId={userId} />
        </TabsContent>
        
        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Journey Tracking Implementation Guide</CardTitle>
              <CardDescription>
                How to implement user journey tracking across your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Components Overview</h3>
                <p className="mb-4">
                  The journey tracking system consists of several key components that work together:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>UserJourneyTracker</strong>: Core component that tracks journey stages.
                    Place this on key pages and user interaction points.
                  </li>
                  <li>
                    <strong>PageViewTracker</strong>: Tracks page views with journey context.
                    Use this on every page to capture navigation patterns.
                  </li>
                  <li>
                    <strong>useTracking Hook</strong>: Underlying hook that handles sending tracking data.
                    Used by the tracker components but can also be used directly.
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Implementing Journey Tracking</h3>
                <p className="mb-4">
                  To implement comprehensive journey tracking across your application:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Identify key journey stages</strong>: Map out the important stages in your user journey.
                    Examples: first_visit, authentication, feature_discovery, etc.
                  </li>
                  <li>
                    <strong>Place UserJourneyTracker on key pages</strong>:
                    <pre className="bg-muted p-3 rounded-md text-sm mt-2">
{`// On landing page
<UserJourneyTracker journeyStage="first_visit" />

// On authentication page
<UserJourneyTracker journeyStage="authentication" />

// On profile page
<UserJourneyTracker journeyStage="profile_creation" />`}
                    </pre>
                  </li>
                  <li>
                    <strong>Add context with additionalData</strong>:
                    <pre className="bg-muted p-3 rounded-md text-sm mt-2">
{`<UserJourneyTracker 
  journeyStage="feature_discovery" 
  additionalData={{
    feature: "care_management",
    source: "dashboard",
    user_segment: "family"
  }}
/>`}
                    </pre>
                  </li>
                  <li>
                    <strong>Track key interactions</strong>: For important user actions, track journey stages programmatically:
                    <pre className="bg-muted p-3 rounded-md text-sm mt-2">
{`import { useTracking } from "@/hooks/useTracking";

const MyComponent = () => {
  const { trackEngagement } = useTracking();
  
  const handleImportantAction = async () => {
    // Handle the action...
    
    // Then track the journey stage
    await trackEngagement('user_journey_progress', {
      journey_stage: 'conversion',
      action: 'subscription_purchase',
      plan_type: 'premium'
    });
  };
  
  return (
    <Button onClick={handleImportantAction}>
      Subscribe Now
    </Button>
  );
};`}
                    </pre>
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Journey Analytics</h3>
                <p>
                  The journey data is stored in the <code>cta_engagement_tracking</code> table with <code>action_type='user_journey_progress'</code>.
                  Use queries to analyze:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Journey stage conversion rates</li>
                  <li>Time spent between stages</li>
                  <li>Drop-off points in the user journey</li>
                  <li>Segment performance by user role or other criteria</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
};
