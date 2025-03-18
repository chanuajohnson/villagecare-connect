
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';

interface SubscriptionFeatureLinkProps {
  /**
   * The name of the premium feature being accessed
   */
  featureType: string;
  
  /**
   * Path to return to after subscription flow (usually the current feature path)
   */
  returnPath: string;
  
  /**
   * Path of the referring page (where this link appears)
   */
  referringPagePath: string;
  
  /**
   * Label for the referring page (for breadcrumbs)
   */
  referringPageLabel: string;
  
  /**
   * Children to render inside the button
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Button variant
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Skip the features page and go directly to subscription page
   */
  directToSubscription?: boolean;
}

export const SubscriptionFeatureLink = ({
  featureType,
  returnPath,
  referringPagePath,
  referringPageLabel,
  children,
  className,
  variant = "default",
  directToSubscription = false
}: SubscriptionFeatureLinkProps) => {
  const { user } = useAuth();
  
  // Determine proper destination - features page or direct to subscription
  const destinationPath = directToSubscription ? "/subscription" : "/subscription-features";
  
  return (
    <Link
      to={destinationPath}
      state={{
        featureType,
        returnPath,
        referringPagePath,
        referringPageLabel,
        directSubscription: directToSubscription
      }}
      className={className}
    >
      <Button 
        className="w-full"
        variant={variant}
      >
        {children || (user ? "Upgrade to Access" : "Subscribe to Access")}
      </Button>
    </Link>
  );
};
