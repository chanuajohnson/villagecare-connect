
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { Story } from "./StoryList";

interface StoryCardProps {
  story: Story;
  onReadMore: () => void;
}

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return "?";
  
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Helper function to truncate text
const truncateText = (text: string, maxLength = 150) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
};

export const StoryCard = ({ story, onReadMore }: StoryCardProps) => {
  const initials = getInitials(story.full_name || "");
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 flex-grow space-y-3">
        <div className="flex items-center justify-between">
          <Avatar className="h-12 w-12 border-2 border-primary-100 bg-primary-50">
            <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            {story.birth_year && (
              <p className="text-sm text-gray-600">Born in {story.birth_year}</p>
            )}
          </div>
        </div>
        
        {/* Personality Traits */}
        {story.personality_traits && story.personality_traits.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Personality</p>
            <div className="flex flex-wrap gap-1">
              {story.personality_traits.slice(0, 3).map((trait, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                  {trait}
                </Badge>
              ))}
              {story.personality_traits.length > 3 && (
                <Badge variant="outline" className="text-xs bg-blue-50">
                  +{story.personality_traits.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Career Fields */}
        {story.career_fields && story.career_fields.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Career</p>
            <p className="text-sm">
              {story.career_fields.slice(0, 2).join(", ")}
              {story.career_fields.length > 2 && ", ..."}
            </p>
          </div>
        )}
        
        {/* Hobbies & Interests */}
        {story.hobbies_interests && story.hobbies_interests.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Interests</p>
            <p className="text-sm">
              {story.hobbies_interests.slice(0, 3).join(", ")}
              {story.hobbies_interests.length > 3 && ", ..."}
            </p>
          </div>
        )}
        
        {/* Life Story Preview */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Their Story
          </p>
          <p className="text-sm text-gray-600 line-clamp-4 mt-1">
            {truncateText(story.life_story || "", 160)}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          variant="outline" 
          className="w-full text-primary hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500 group"
          onClick={onReadMore}
        >
          <span>Read More</span>
          <BookOpen className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};
