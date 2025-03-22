
import { useEffect, useState } from "react";
import { useTracking } from "@/hooks/useTracking";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserJourneyTracker, UserJourneyStage } from "@/components/tracking/UserJourneyTracker";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User } from "lucide-react";

interface UserJourneyMonitorProps {
  userId: string;
}

/**
 * UserJourneyMonitor - A component to monitor and track a specific user's journey
 * 
 * This component demonstrates how to:
 * 1. Track the current stage of a specific user's journey
 * 2. View historical journey data for the user
 * 3. Manually trigger journey tracking events
 */
export const UserJourneyMonitor = ({ userId }: UserJourneyMonitorProps) => {
  const { trackEngagement } = useTracking();
  const { user } = useAuth();
  const [journeyHistory, setJourneyHistory] = useState<any[]>([]);
  const [currentStage, setCurrentStage] = useState<UserJourneyStage>("first_visit");
  const [loading, setLoading] = useState(true);
  const [newStage, setNewStage] = useState<string>("");

  // Fetch historical journey data for this user
  useEffect(() => {
    const fetchUserJourneyData = async () => {
      try {
        setLoading(true);
        
        // Query the tracking table for this specific user
        const { data, error } = await supabase
          .from('cta_engagement_tracking')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching journey data:", error);
          return;
        }
        
        // Filter for journey events specifically
        const journeyEvents = data.filter(event => 
          event.action_type === 'user_journey_progress' || 
          event.additional_data?.journey_stage
        );
        
        setJourneyHistory(journeyEvents);
        
        // Set the current stage based on the most recent journey event
        if (journeyEvents.length > 0) {
          const latestEvent = journeyEvents[0];
          setCurrentStage(latestEvent.additional_data?.journey_stage || "active_usage");
        }
      } catch (err) {
        console.error("Error in journey data fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserJourneyData();
    }
  }, [userId]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Manually track a new journey stage
  const trackNewStage = async () => {
    if (!newStage) return;
    
    try {
      await trackEngagement('user_journey_progress', {
        journey_stage: newStage,
        target_user_id: userId,
        manual_tracking: true,
        tracked_by: user?.id || 'anonymous_admin'
      });
      
      // Refresh the journey history
      const { data } = await supabase
        .from('cta_engagement_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (data) {
        const journeyEvents = data.filter(event => 
          event.action_type === 'user_journey_progress' || 
          event.additional_data?.journey_stage
        );
        
        setJourneyHistory(journeyEvents);
        setCurrentStage(newStage as UserJourneyStage);
      }
      
      setNewStage("");
    } catch (error) {
      console.error("Error tracking new stage:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invisible tracker that continues to track the current stage */}
      <UserJourneyTracker 
        journeyStage={currentStage} 
        additionalData={{ target_user_id: userId, monitored_user: true }}
        trackOnce={false}
      />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Journey Monitoring</CardTitle>
              <CardDescription>
                Tracking user {userId}
              </CardDescription>
            </div>
            <Badge className="ml-2">
              {loading ? "Loading..." : `Current Stage: ${currentStage}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="Enter a new journey stage to track"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
              <Button onClick={trackNewStage}>Track Stage</Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Journey History</h3>
              {loading ? (
                <div className="text-center py-4">Loading journey data...</div>
              ) : journeyHistory.length === 0 ? (
                <div className="text-center py-4">No journey data available for this user.</div>
              ) : (
                <div className="space-y-2">
                  {journeyHistory.map((event, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">
                            {event.additional_data?.journey_stage || "Unknown Stage"}
                          </span>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(event.created_at)}
                          </div>
                        </div>
                        <Badge variant={event.additional_data?.manual_tracking ? "outline" : "default"}>
                          {event.additional_data?.manual_tracking ? "Manual" : "Automatic"}
                        </Badge>
                      </div>
                      {event.additional_data && Object.keys(event.additional_data).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <details>
                            <summary className="cursor-pointer">Additional Data</summary>
                            <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.additional_data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground flex items-center">
            <User className="h-4 w-4 mr-1" />
            User ID: {userId}
          </div>
          <Button variant="link" size="sm" className="text-xs">
            View Full Analytics <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Journey Tracking Guide</CardTitle>
          <CardDescription>
            How to use the journey tracking system effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium">Common Journey Stages</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>first_visit</strong>: User's initial visit to the platform</li>
                <li><strong>authentication</strong>: User signs up or logs in</li>
                <li><strong>profile_creation</strong>: User creates or completes their profile</li>
                <li><strong>feature_discovery</strong>: User explores key features</li>
                <li><strong>matching_exploration</strong>: User explores caregiver/family matching</li>
                <li><strong>subscription_consideration</strong>: User views subscription options</li>
                <li><strong>active_usage</strong>: User actively engaging with the platform</li>
                <li><strong>return_visit</strong>: User returns after period of inactivity</li>
                <li><strong>conversion</strong>: User completes a key conversion action</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-medium">Implementation Examples</h3>
              <div className="bg-muted p-3 rounded-md text-sm mt-2">
                <pre>{`// Track a specific journey stage
<UserJourneyTracker 
  journeyStage="feature_discovery" 
  additionalData={{ feature: "care_plan" }}
/>

// Track once per session
<UserJourneyTracker 
  journeyStage="subscription_consideration" 
  trackOnce={true}
/>

// Track with custom data
<UserJourneyTracker 
  journeyStage="matching_exploration" 
  additionalData={{ 
    filters_applied: true,
    search_terms: ["caregiver", "special needs"],
    results_count: 5
  }}
/>`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium">Best Practices</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Use consistent journey stage names across the platform</li>
                <li>Include contextual data in the additionalData prop</li>
                <li>Place UserJourneyTracker on key pages and user interaction points</li>
                <li>Use trackOnce={true} for stages that should only be counted once per session</li>
                <li>Review journey analytics regularly to identify drop-off points</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
