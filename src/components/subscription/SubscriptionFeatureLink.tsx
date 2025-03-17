
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SubscriptionFeatureLinkProps {
  featureType: string;
  returnPath: string;
  referringPagePath: string;
  referringPageLabel: string;
  children?: React.ReactNode;
  className?: string;
}

export const SubscriptionFeatureLink = ({
  featureType,
  returnPath,
  referringPagePath,
  referringPageLabel,
  children,
  className
}: SubscriptionFeatureLinkProps) => {
  return (
    <Link
      to="/subscription-features"
      state={{
        featureType,
        returnPath,
        referringPagePath,
        referringPageLabel
      }}
      className={className}
    >
      <Button className="w-full">
        {children || "Learn about Premium Features"}
      </Button>
    </Link>
  );
};
