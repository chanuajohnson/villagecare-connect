
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StoryCardProps {
  id: string;
  fullName: string;
  birthYear: string;
  personalityTraits: string[];
  careerFields: string[];
  hobbiesInterests: string[];
  lifeStory: string;
  onReadMoreClick: (id: string) => void;
}

export function StoryCard({
  id,
  fullName,
  birthYear,
  personalityTraits,
  careerFields,
  hobbiesInterests,
  lifeStory,
  onReadMoreClick,
}: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Create initials from full name (e.g., "John Doe" -> "JD")
  const initials = fullName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
    
  // Truncate life story for preview
  const MAX_PREVIEW_LENGTH = 200;
  const previewText = lifeStory && lifeStory.length > MAX_PREVIEW_LENGTH 
    ? lifeStory.substring(0, MAX_PREVIEW_LENGTH) + "..." 
    : lifeStory || "";

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-12 w-12 bg-primary/10">
            <AvatarFallback className="font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Initials: {initials}</p>
            <p className="text-sm text-muted-foreground">Born in {birthYear}</p>
          </div>
        </div>
        
        {personalityTraits && personalityTraits.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Personality</p>
            <div className="flex flex-wrap gap-1">
              {personalityTraits.slice(0, 3).map((trait, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {trait}
                </Badge>
              ))}
              {personalityTraits.length > 3 && (
                <Badge variant="outline" className="bg-blue-50">
                  +{personalityTraits.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {careerFields && careerFields.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Career</p>
            <p className="text-sm">{careerFields.join(", ")}</p>
          </div>
        )}
        
        {hobbiesInterests && hobbiesInterests.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Interests</p>
            <p className="text-sm">{hobbiesInterests.join(", ")}</p>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm font-medium mb-1">Life Story</p>
          <p className="text-sm text-gray-600">
            {expanded ? lifeStory : previewText}
          </p>
          {lifeStory && lifeStory.length > MAX_PREVIEW_LENGTH && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-primary mt-1 hover:underline"
            >
              Show more
            </button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <Button 
          onClick={() => onReadMoreClick(id)} 
          variant="outline" 
          className="w-full"
        >
          Read Full Story
        </Button>
      </CardFooter>
    </Card>
  );
}
