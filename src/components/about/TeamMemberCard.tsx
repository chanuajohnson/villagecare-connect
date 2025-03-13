
import { Card, CardContent } from '@/components/ui/card';

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
}

export const TeamMemberCard = ({ name, role, bio, imageSrc }: TeamMemberCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img 
          src={imageSrc} 
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg text-primary-800">{name}</h3>
        <p className="text-primary-600 mb-3">{role}</p>
        <p className="text-gray-600 text-sm">{bio}</p>
      </CardContent>
    </Card>
  );
};
