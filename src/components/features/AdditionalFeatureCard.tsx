
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UpvoteFeatureButton } from '@/components/features/UpvoteFeatureButton';
import { LucideIcon } from 'lucide-react';

interface AdditionalFeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  noList?: boolean;
  benefits?: string[];
}

export const AdditionalFeatureCard = ({
  title,
  description,
  icon: Icon,
  status = 'planned',
  noList,
  benefits
}: AdditionalFeatureProps) => {
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon className="h-5 w-5" />
              {title}
            </CardTitle>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${statusColors[status]}`}>
              {formatStatus(status)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {description}
        </CardDescription>
        {!noList && benefits && (
          <div className="space-y-2 text-sm">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                {benefit}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <UpvoteFeatureButton
            featureTitle={title}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
