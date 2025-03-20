
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FamilyProfile, getProfessionalMatches } from "@/utils/advancedMatching";

export function DashboardFamilyMatches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Array<FamilyProfile & { matchScore: number }>>([]);
  
  useEffect(() => {
    async function loadMatches() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const matchResults = await getProfessionalMatches(user.id, 3);
        setMatches(matchResults);
      } catch (error) {
        console.error("Error loading matches:", error);
        toast.error("Failed to load family matches");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMatches();
  }, [user]);
  
  return (
    <UserJourneyTracker 
      stage="Feature Discovery" 
      feature="family_matching" 
      component="DashboardFamilyMatches"
    >
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Family Matches</CardTitle>
          <CardDescription>
            Families seeking caregivers with your skills and experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2 flex-grow">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <div className="font-medium">
                        {match.care_recipient?.full_name || "Care Recipient"}
                      </div>
                      <div className="text-xs text-gray-500">{match.location || "Location not specified"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-primary">
                        Match: {Math.round(match.matchScore)}%
                      </div>
                      <div className="w-16 mt-1">
                        <Progress value={match.matchScore} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {match.care_types?.slice(0, 2).map((type, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {match.care_types && match.care_types.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{match.care_types.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-1">No matches found yet</p>
              <p className="text-sm text-gray-400">Complete your profile to improve matching</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button 
            className="w-full" 
            onClick={() => navigate("/professional/matching")}
          >
            View All Matches
          </Button>
        </CardFooter>
      </Card>
    </UserJourneyTracker>
  );
}
