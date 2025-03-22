
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompleteTracker } from "./CompleteTracker";
import { useCompleteTracking } from "@/hooks/useCompleteTracking";
import { UserJourneyStage } from "./UserJourneyTracker";

/**
 * Demo component that showcases different ways to use the integrated tracking system
 */
export const TrackingIntegrationDemo = () => {
  const [activeTab, setActiveTab] = useState("declarative");
  const { trackWithJourney, trackFeatureWithJourney } = useCompleteTracking();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Track tab change with journey context
    trackFeatureWithJourney(
      "tracking_demo",
      "tab_change",
      "feature_discovery",
      { tab: value }
    );
  };
  
  const handleButtonClick = (interactionType: string, journeyStage: UserJourneyStage) => {
    trackWithJourney(
      `demo_button_${interactionType}`,
      journeyStage,
      {
        demo_section: activeTab,
        interaction_type: interactionType
      }
    );
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* Track this component view */}
      <CompleteTracker
        pageTracking={{ 
          actionType: "tracking_demo_view",
          additionalData: { demo_type: "integration" }
        }}
        journeyTracking={{
          journeyStage: "feature_discovery",
          additionalData: { feature: "tracking_integration" }
        }}
      />
      
      <CardHeader>
        <CardTitle>Integrated Tracking Demo</CardTitle>
        <CardDescription>
          See different ways to implement the tracking system in your application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="declarative">Declarative Tracking</TabsTrigger>
            <TabsTrigger value="programmatic">Programmatic Tracking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="declarative" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Using CompleteTracker Component</h3>
              <p className="text-muted-foreground">
                The CompleteTracker component provides a declarative way to track page views and journey stages together.
              </p>
              
              <div className="rounded-md border p-4 mt-4">
                <h4 className="font-medium mb-2">Live Example:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Example card with its own tracking */}
                  <Card>
                    <CompleteTracker
                      journeyTracking={{
                        journeyStage: "feature_discovery",
                        additionalData: { feature: "card_1", location: "demo" }
                      }}
                    />
                    <CardHeader>
                      <CardTitle className="text-base">Feature Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">This card tracks feature discovery.</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        size="sm"
                        onClick={() => handleButtonClick("explore", "feature_discovery")}
                      >
                        Explore
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Example card with its own tracking */}
                  <Card>
                    <CompleteTracker
                      journeyTracking={{
                        journeyStage: "conversion",
                        additionalData: { feature: "card_2", location: "demo" }
                      }}
                    />
                    <CardHeader>
                      <CardTitle className="text-base">Conversion Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">This card tracks conversion opportunities.</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleButtonClick("convert", "conversion")}
                      >
                        Subscribe
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Example Code:</h4>
                <pre className="text-xs overflow-auto p-2 bg-background rounded">
{`// Basic page with journey tracking
<CompleteTracker
  pageTracking={{ 
    actionType: "feature_page_view",
    additionalData: { feature_id: "12345" } 
  }}
  journeyTracking={{
    journeyStage: "feature_discovery",
    additionalData: { feature_name: "advanced_matching" }
  }}
/>

// Component-level tracking
<Card>
  <CompleteTracker
    journeyTracking={{
      journeyStage: "conversion",
      additionalData: { component: "pricing_card" }
    }}
  />
  <CardHeader>
    <CardTitle>Premium Plan</CardTitle>
  </CardHeader>
  <CardContent>
    <p>$29.99/month</p>
  </CardContent>
  <CardFooter>
    <Button>Subscribe</Button>
  </CardFooter>
</Card>`}
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="programmatic" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Using useCompleteTracking Hook</h3>
              <p className="text-muted-foreground">
                The useCompleteTracking hook provides a programmatic way to track user interactions with journey context.
              </p>
              
              <div className="rounded-md border p-4 mt-4">
                <h4 className="font-medium mb-2">Live Example:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Button 
                      className="w-full"
                      onClick={() => trackFeatureWithJourney(
                        "tracking_demo", 
                        "explore",
                        "feature_discovery",
                        { button: "explore_feature", method: "hook" }
                      )}
                    >
                      Track Feature Exploration
                    </Button>
                    
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => trackWithJourney(
                        "user_preference_selected",
                        "profile_creation",
                        { preference: "notification_settings", method: "hook" }
                      )}
                    >
                      Track User Preference
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full"
                      variant="default"
                      onClick={() => trackWithJourney(
                        "subscription_cta_click",
                        "conversion",
                        { plan: "premium", location: "demo", method: "hook" }
                      )}
                    >
                      Track Subscription Interest
                    </Button>
                    
                    <Button 
                      className="w-full"
                      variant="secondary"
                      onClick={() => trackFeatureWithJourney(
                        "matching", 
                        "view_matches",
                        "matching_exploration",
                        { match_count: 5, method: "hook" }
                      )}
                    >
                      Track Matching Exploration
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Example Code:</h4>
                <pre className="text-xs overflow-auto p-2 bg-background rounded">
{`import { useCompleteTracking } from "@/hooks/useCompleteTracking";

const MyComponent = () => {
  const { trackWithJourney, trackFeatureWithJourney } = useCompleteTracking();
  
  const handleSubscribeClick = () => {
    // Handle subscription logic
    
    // Track with journey context
    trackWithJourney(
      "subscription_initiated",
      "conversion",
      { 
        plan_type: "premium",
        source: "pricing_page" 
      }
    );
  };
  
  const handleFeatureInteraction = (featureName, action) => {
    // Handle feature interaction
    
    // Track feature interaction with journey stage
    trackFeatureWithJourney(
      featureName,
      action,
      "feature_discovery",
      { source: "feature_explorer" }
    );
  };
  
  return (
    <div>
      <Button onClick={handleSubscribeClick}>
        Subscribe Now
      </Button>
      
      <Button onClick={() => handleFeatureInteraction("messaging", "open")}>
        Open Messaging
      </Button>
    </div>
  );
};`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          All interactions on this page are being tracked
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = "/dashboard/admin/journey-analytics"}
        >
          View Analytics
        </Button>
      </CardFooter>
    </Card>
  );
};
