
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { FamilyProfile } from "@/utils/advancedMatching";

interface AdvancedFamilyMatchCardProps {
  match: FamilyProfile & { matchScore: number; matchDetails: any };
  onContactClick: (familyId: string) => void;
}

export function AdvancedFamilyMatchCard({ match, onContactClick }: AdvancedFamilyMatchCardProps) {
  const careRecipient = match.care_recipient;
  
  return (
    <MatchingTracker matchType="advanced_family" matchId={match.id} matchScore={match.matchScore}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {match.care_recipient?.full_name || "Care Recipient"}
              </CardTitle>
              <div className="text-sm text-gray-500">{match.location || "Location not specified"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary">
                Match: {Math.round(match.matchScore)}%
              </div>
              <div className="w-20 mt-1">
                <Progress value={match.matchScore} className="h-2" />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow pb-4">
          <div className="space-y-3">
            {/* Care needs */}
            <div>
              <h4 className="text-sm font-medium mb-1">Care Needs</h4>
              <div className="flex flex-wrap gap-1">
                {match.care_types?.map((type, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {(!match.care_types || match.care_types.length === 0) && (
                  <span className="text-xs text-gray-500">No care needs specified</span>
                )}
              </div>
            </div>
            
            {/* Special needs */}
            {match.special_needs && match.special_needs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Special Needs</h4>
                <div className="flex flex-wrap gap-1">
                  {match.special_needs.map((need, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Personality traits - from care recipient profile */}
            {careRecipient?.personality_traits && careRecipient.personality_traits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Personality</h4>
                <div className="flex flex-wrap gap-1">
                  {careRecipient.personality_traits.map((trait, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hobbies & Interests - from care recipient profile */}
            {careRecipient?.hobbies_interests && careRecipient.hobbies_interests.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {careRecipient.hobbies_interests.map((hobby, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-purple-200 bg-purple-50 text-purple-700">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Match details */}
            <div>
              <h4 className="text-sm font-medium mb-1">Why You Match</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {match.matchDetails.careTypesMatch > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Care expertise</span>
                  </div>
                )}
                {match.matchDetails.specialNeedsMatch > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Special needs</span>
                  </div>
                )}
                {match.matchDetails.personalityMatch > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Personality fit</span>
                  </div>
                )}
                {match.matchDetails.interestsMatch > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Shared interests</span>
                  </div>
                )}
                {match.matchDetails.culturalMatch > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Cultural alignment</span>
                  </div>
                )}
                {match.matchDetails.locationMatch > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Location</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <div className="px-6 pb-6 mt-auto">
          <Button 
            onClick={() => onContactClick(match.id)} 
            className="w-full"
          >
            Contact Family
          </Button>
        </div>
      </Card>
    </MatchingTracker>
  );
}
