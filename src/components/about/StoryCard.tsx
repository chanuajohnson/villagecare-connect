import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
interface StoryCardProps {
  isActive: boolean;
  onClick: () => void;
}
export const StoryCard = ({
  isActive,
  onClick
}: StoryCardProps) => {
  const [readMore, setReadMore] = useState(false);
  return <Card className={`overflow-hidden transition-all duration-300 ${isActive ? 'shadow-lg border-primary-300' : 'hover:shadow-md'}`} onClick={onClick}>
      <CardHeader className="bg-primary-50">
        <CardTitle className="flex items-center gap-2 text-primary-700">
          <BookOpen className="h-5 w-5" /> Our Story
        </CardTitle>
        <CardDescription>
          How Tavara.care came to be
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className={`space-y-4 ${readMore ? 'h-auto' : 'h-[150px] overflow-hidden'}`}>
          <p>Tavara was born from a personal experience—when our founders’ mother needed care, the family saw firsthand how difficult and fragmented the caregiving system was. Finding reliable caregivers, managing schedules, and ensuring quality care was overwhelming.</p>
          
          <p>This revealed a bigger issue: caregiving doesn’t just need more workers—it needs better systems, stronger communities, and real support for both families and caregivers.</p>

          

          
        </div>
        
        <Button variant="ghost" size="sm" className="mt-4 text-primary-600" onClick={e => {
        e.stopPropagation();
        setReadMore(!readMore);
      }}>
          {readMore ? <>
              <ChevronUp className="mr-1 h-4 w-4" /> Read Less
            </> : <>
              <ChevronDown className="mr-1 h-4 w-4" /> Read More
            </>}
        </Button>
      </CardContent>
    </Card>;
};