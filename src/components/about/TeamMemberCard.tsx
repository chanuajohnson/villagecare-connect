
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
}

export const TeamMemberCard = ({ name, role, bio, imageSrc }: TeamMemberCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
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
    </motion.div>
  );
};
