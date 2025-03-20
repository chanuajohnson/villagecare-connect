
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: {
    id: string;
    fullName: string;
    birthYear: string;
    personalityTraits: string[];
    careerFields: string[];
    hobbiesInterests: string[];
    lifeStory: string;
    joyfulThings?: string;
    uniqueFacts?: string;
    challenges?: string[];
  } | null;
}

export function StoryDetailModal({ 
  isOpen, 
  onClose, 
  story 
}: StoryDetailModalProps) {
  if (!story) return null;
  
  // Create initials from full name
  const initials = story.fullName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 bg-primary/10">
              <AvatarFallback className="font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>Legacy Story</DialogTitle>
              <DialogDescription>
                Born in {story.birthYear}
              </DialogDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {story.personalityTraits?.map((trait, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50">
                {trait}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-6">
            {story.careerFields && story.careerFields.length > 0 && (
              <div>
                <h3 className="text-base font-medium mb-2">Career & Achievements</h3>
                <p>{story.careerFields.join(", ")}</p>
              </div>
            )}
            
            {story.hobbiesInterests && story.hobbiesInterests.length > 0 && (
              <div>
                <h3 className="text-base font-medium mb-2">Hobbies & Interests</h3>
                <p>{story.hobbiesInterests.join(", ")}</p>
              </div>
            )}
            
            {story.lifeStory && (
              <div>
                <h3 className="text-base font-medium mb-2">Life Story</h3>
                <p className="whitespace-pre-line">{story.lifeStory}</p>
              </div>
            )}
            
            {story.joyfulThings && (
              <div>
                <h3 className="text-base font-medium mb-2">Joyful Moments</h3>
                <p className="whitespace-pre-line">{story.joyfulThings}</p>
              </div>
            )}
            
            {story.challenges && story.challenges.length > 0 && (
              <div>
                <h3 className="text-base font-medium mb-2">Challenges Overcome</h3>
                <p>{story.challenges.join(", ")}</p>
              </div>
            )}
            
            {story.uniqueFacts && (
              <div>
                <h3 className="text-base font-medium mb-2">Unique Facts</h3>
                <p className="whitespace-pre-line">{story.uniqueFacts}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
