
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UpvoteFeatureButton } from '@/components/features/UpvoteFeatureButton';

interface DatabaseFeature {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  _count?: {
    votes: number;
  };
}

export const DatabaseFeatureCard = ({ feature }: { feature: DatabaseFeature }) => {
  const statusColors = {
    planned: 'bg-gray-100 text-gray-800',
    in_development: 'bg-blue-100 text-blue-800',
    ready_for_demo: 'bg-green-100 text-green-800',
    launched: 'bg-purple-100 text-purple-800'
  };

  const formatStatus = (status: string) => {
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${statusColors[feature.status]}`}>
              {formatStatus(feature.status)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {feature.description}
        </CardDescription>
        <div className="mt-4">
          <UpvoteFeatureButton
            featureId={feature.id}
            featureTitle={feature.title}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
