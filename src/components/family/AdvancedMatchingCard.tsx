
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";
import { useNavigate } from "react-router-dom";
import { CaregiverMatchingCard } from "./CaregiverMatchingCard";
import { useEffect, useState } from "react";
import { ProfessionalProfile, getFamilyMatches } from "@/utils/advancedMatching";
import { useAuth } from "@/components/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function AdvancedMatchingCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Array<ProfessionalProfile & { matchScore: number }>>([]);
  const [showAllMatches, setShowAllMatches] = useState(false);
  
  useEffect(() => {
    async function loadMatches() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const matchResults = await getFamilyMatches(user.id);
        setMatches(matchResults);
      } catch (error) {
        console.error("Error loading matches:", error);
        toast.error("Failed to load caregiver matches");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMatches();
  }, [user]);
  
  const displayedMatches = showAllMatches ? matches : matches.slice(0, 3);
  
  const hasStoryData = matches.some(match => match.matchScore > 50);
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-primary">Advanced Caregiver Matching</CardTitle>
            <CardDescription>
              Find the perfect caregiver based on personality, interests, and care needs
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Enhanced
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {displayedMatches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium">{match.first_name} {match.last_name}</h3>
                    <p className="text-sm text-gray-500">{match.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">
                      Match Score: {Math.round(match.matchScore)}%
                    </div>
                    <div className="w-24 mt-1">
                      <Progress value={match.matchScore} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="text-sm mt-2">
                  <p className="line-clamp-2">{match.bio || "Professional caregiver with experience in various care settings."}</p>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.caregiving_areas?.slice(0, 3).map((area, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {match.caregiving_areas && match.caregiving_areas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{match.caregiving_areas.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {matches.length > 3 && (
              <Button 
                variant="ghost" 
                className="w-full text-primary" 
                onClick={() => setShowAllMatches(!showAllMatches)}
              >
                {showAllMatches ? "Show less" : `Show ${matches.length - 3} more matches`}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">No advanced matches found yet</p>
            <p className="text-sm text-gray-400">
              {hasStoryData 
                ? "We're still searching for the perfect caregiver match for you." 
                : "Tell us more about your loved one to get personalized matches."}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 pt-2">
        <UserJourneyTracker 
          stage="Feature Discovery" 
          feature="advanced_matching"
          component="AdvancedMatchingCard"
        >
          <Button 
            className="w-full" 
            onClick={() => navigate("/family/matching")}
          >
            Find Caregivers
          </Button>
        </UserJourneyTracker>
        
        {!hasStoryData && (
          <UserJourneyTracker 
            stage="Feature Discovery" 
            feature="tell_their_story"
            component="AdvancedMatchingCard"
          >
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/family/story")}
            >
              Tell Their Story to Improve Matches
            </Button>
          </UserJourneyTracker>
        )}
      </CardFooter>
    </Card>
  );
}
