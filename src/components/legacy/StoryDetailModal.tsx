
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, BookOpen, Calendar, Briefcase, Heart } from "lucide-react";

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

// Helper function to get initials
const getInitials = (name: string): string => {
  if (!name) return "?";
  
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const StoryDetailModal = ({ story, open, onClose }: StoryDetailModalProps) => {
  const initials = getInitials(story.full_name || "");
  
  // Split the life story into paragraphs
  const paragraphs = story.life_story?.split(/\n\n|\n/) || [];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-14 w-14 border-2 border-primary-100 bg-primary-50">
              <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <DialogTitle className="text-xl">{story.full_name}</DialogTitle>
              {story.birth_year && (
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  Born in {story.birth_year}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Personality Traits */}
          {story.personality_traits && story.personality_traits.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Heart className="h-4 w-4 mr-1 text-gray-600" />
                Personality
              </h3>
              <div className="flex flex-wrap gap-1">
                {story.personality_traits.map((trait, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Career Fields */}
          {story.career_fields && story.career_fields.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Briefcase className="h-4 w-4 mr-1 text-gray-600" />
                Career & Achievements
              </h3>
              <p className="text-sm text-gray-700">
                {story.career_fields.join(", ")}
              </p>
            </div>
          )}
          
          {/* Hobbies & Interests */}
          {story.hobbies_interests && story.hobbies_interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <BookOpen className="h-4 w-4 mr-1 text-gray-600" />
                Hobbies & Interests
              </h3>
              <p className="text-sm text-gray-700">
                {story.hobbies_interests.join(", ")}
              </p>
            </div>
          )}
          
          {/* Life Story */}
          <div className="space-y-2 border-t pt-4 mt-6">
            <h3 className="text-md font-medium text-gray-800">Their Story</h3>
            <div className="text-gray-700 space-y-3">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No life story available.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
