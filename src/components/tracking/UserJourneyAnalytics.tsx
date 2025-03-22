
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { CompleteTracker } from "@/components/tracking/CompleteTracker";
import { UserJourneyMonitor } from "@/components/tracking/UserJourneyMonitor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompleteTracking } from "@/hooks/useCompleteTracking";
import { UserJourneyStage } from "@/components/tracking/UserJourneyTracker";

export const UserJourneyAnalytics = () => {
  // Default to the specified user ID
  const [userId, setUserId] = useState("d18b867c-fd20-4b59-b355-846e0853eb8a");
  const [inputUserId, setInputUserId] = useState("");
  const { trackFeatureWithJourney } = useCompleteTracking();

  const handleFeatureExplore = (featureName: string) => {
    trackFeatureWithJourney(
      featureName,
      "explore",
      "feature_discovery",
      { location: "analytics_page", user_filtered: userId }
    );
  };

  return (
    <Container className="py-8">
      {/* Use CompleteTracker for combined tracking */}
      <CompleteTracker 
        pageTracking={{ 
          actionType: "admin_analytics_view", 
          additionalData: { section: "user_journey" }
        }}
        journeyTracking={{
          journeyStage: "active_usage",
          additionalData: { feature: "journey_analytics" }
        }}
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
              <Button onClick={() => {
                setUserId(inputUserId || "d18b867c-fd20-4b59-b355-846e0853eb8a");
                // Track this action with journey context
                trackFeatureWithJourney(
                  "user_filter", 
                  "apply",
                  "active_usage", 
                  { filtered_user_id: inputUserId || "d18b867c-fd20-4b59-b355-846e0853eb8a" }
                );
              }}>
                Track User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="monitor">
        <TabsList className="mb-4">
          <TabsTrigger 
            value="monitor" 
            onClick={() => handleFeatureExplore("journey_monitor")}
          >
            User Journey Monitor
          </TabsTrigger>
          <TabsTrigger 
            value="guide" 
            onClick={() => handleFeatureExplore("implementation_guide")}
          >
            Implementation Guide
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="monitor">
          <UserJourneyMonitor userId={userId} />
        </TabsContent>
        
        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Journey Tracking Implementation Guide</CardTitle>
              <CardDescription>
                How to implement unified tracking across your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Tracking System Overview</h3>
                <p className="mb-4">
                  Our tracking system consists of several integrated components:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>CompleteTracker</strong>: Unified component that combines PageView and Journey tracking.
                    The simplest way to track across multiple dimensions.
                  </li>
                  <li>
                    <strong>useCompleteTracking Hook</strong>: Programmatic tracking that integrates journey stages
                    with specific actions.
                  </li>
                  <li>
                    <strong>UserJourneyTracker</strong>: Core component for tracking journey stages.
                  </li>
                  <li>
                    <strong>PageViewTracker</strong>: Tracks page views with journey context.
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Using the CompleteTracker</h3>
                <p className="mb-4">
                  The CompleteTracker is the simplest way to implement comprehensive tracking:
                </p>
                <pre className="bg-muted p-3 rounded-md text-sm mt-2">
{`// Basic implementation
<CompleteTracker 
  pageTracking={{ actionType: "dashboard_view" }}
  journeyTracking={{ journeyStage: "active_usage" }}
/>

// With additional context
<CompleteTracker 
  pageTracking={{ 
    actionType: "caregiver_matching_page_view", 
    additionalData: { results_count: results.length } 
  }}
  journeyTracking={{ 
    journeyStage: "matching_exploration", 
    additionalData: { match_quality: "high" }
  }}
/>`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Programmatic Tracking with useCompleteTracking</h3>
                <p className="mb-4">
                  For tracking user interactions and events programmatically:
                </p>
                <pre className="bg-muted p-3 rounded-md text-sm mt-2">
{`import { useCompleteTracking } from "@/hooks/useCompleteTracking";

const MyComponent = () => {
  const { trackWithJourney, trackFeatureWithJourney } = useCompleteTracking();
  
  const handleImportantAction = async () => {
    // Handle the action logic...
    
    // Then track with journey context
    await trackWithJourney(
      'subscription_initiated', 
      'subscription_consideration',
      {
        plan_type: 'premium',
        source: 'matching_page'
      }
    );
  };
  
  const handleFeatureExplore = () => {
    trackFeatureWithJourney(
      'care_coordination',
      'view',
      'feature_discovery',
      { source: 'dashboard' }
    );
  };
  
  return (
    <>
      <Button onClick={handleImportantAction}>Subscribe</Button>
      <Button onClick={handleFeatureExplore}>Explore Feature</Button>
    </>
  );
};`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Journey Stages</h3>
                <p className="mb-4">
                  Standard journey stages to use consistently across your application:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'first_visit',
                    'authentication',
                    'profile_creation',
                    'feature_discovery',
                    'matching_exploration',
                    'subscription_consideration',
                    'active_usage',
                    'return_visit',
                    'conversion'
                  ].map((stage: UserJourneyStage) => (
                    <li key={stage} className="bg-muted p-2 rounded text-sm font-mono">
                      {stage}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Use <strong>CompleteTracker</strong> for page-level tracking
                  </li>
                  <li>
                    Use <strong>useCompleteTracking</strong> for user interactions
                  </li>
                  <li>
                    Be consistent with journey stage names
                  </li>
                  <li>
                    Include relevant context in additionalData
                  </li>
                  <li>
                    Track both journey progression and specific actions
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Analyzing the Data</h3>
                <p>
                  The integrated tracking system stores all data in the same table with correlated information between
                  page views, journey stages, and specific actions. This allows for powerful analysis:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Follow users through their entire journey</li>
                  <li>See which pages correspond to which journey stages</li>
                  <li>Identify where users drop off</li>
                  <li>Measure time spent in each journey stage</li>
                  <li>Correlate journey stages with conversion events</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
};
