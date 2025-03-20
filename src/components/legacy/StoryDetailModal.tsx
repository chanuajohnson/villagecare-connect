
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Calendar, Briefcase, Heart, X } from "lucide-react";

interface Story {
  id: string;
  full_name: string;
  birth_year: string;
  personality_traits: string[];
  career_fields: string[];
  hobbies_interests: string[];
  life_story: string;
  created_at: string;
}

interface StoryDetailModalProps {
  story: Story;
  open: boolean;
  onClose: () => void;
}

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return "?";
  
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const StoryDetailModal = ({ story, open, onClose }: StoryDetailModalProps) => {
  const initials = getInitials(story.full_name || "");
  
  // Helper to format paragraphs
  const formatLifeStory = (text: string) => {
    if (!text) return "";
    return text
      .split('\n')
      .map((paragraph, i) => paragraph.trim() && <p key={i} className="mb-4">{paragraph}</p>);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary-100 bg-primary-50">
              <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-primary-900">
                {story.full_name ? `${initials}'s Story` : "Their Story"}
              </DialogTitle>
              {story.birth_year && (
                <DialogDescription className="text-sm flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Born in {story.birth_year}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-6">
            {/* Personality Traits */}
            {story.personality_traits && story.personality_traits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  Personality Traits
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {story.personality_traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Career & Achievements */}
            {story.career_fields && story.career_fields.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  Career & Achievements
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {story.career_fields.map((field, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hobbies & Interests */}
            {story.hobbies_interests && story.hobbies_interests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Heart className="h-4 w-4 text-purple-500" />
                  Hobbies & Interests
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {story.hobbies_interests.map((hobby, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Life Story */}
            <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-semibold text-primary-900 flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-primary" />
                Their Life Story
              </h3>
              <div className="text-gray-700 leading-relaxed">
                {formatLifeStory(story.life_story || "")}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
