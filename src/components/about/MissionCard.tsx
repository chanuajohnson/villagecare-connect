
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';

interface MissionCardProps {
  isActive: boolean;
  onClick: () => void;
}

export const MissionCard = ({ isActive, onClick }: MissionCardProps) => {
  const [readMore, setReadMore] = useState(false);

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        isActive ? 'shadow-lg border-primary-300' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardHeader className="bg-primary-50">
        <CardTitle className="flex items-center gap-2 text-primary-700">
          <Target className="h-5 w-5" /> Our Mission
        </CardTitle>
        <CardDescription>
          What drives everything we do
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className={`space-y-4 ${readMore ? 'h-auto' : 'h-[150px] overflow-hidden'}`}>
          <p>
            At Tavara.care, our mission is to transform caregiving through technology, community, 
            and compassion. We're creating a world where caregiving is valued, supported, and 
            accessible for everyone.
          </p>
          
          <p>
            We believe that by supporting caregivers with the right tools, resources, and 
            connections, we can improve the quality of care for those who need it while also 
            enhancing the wellbeing and professional development of those who provide it.
          </p>

          <p>
            Our platform integrates innovative technology with human-centered design to address 
            the complex challenges of caregiving, from matching families with the right caregivers 
            to providing professional development opportunities and creating supportive communities.
          </p>

          <p>
            Through Tavara.care, we aim to elevate the caregiving profession, empower families 
            with better care options, and create a more compassionate and connected caregiving 
            ecosystem that truly takes a village.
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-4 text-primary-600"
          onClick={(e) => {
            e.stopPropagation();
            setReadMore(!readMore);
          }}
        >
          {readMore ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" /> Read Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" /> Read More
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
