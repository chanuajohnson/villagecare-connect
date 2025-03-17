
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/hooks/useTracking';
import { useRef } from 'react';

interface SubscriptionFeatureLinkProps {
  featureType: string;
  returnPath: string;
  referringPagePath: string;
  referringPageLabel: string;
  source?: string; // Add source parameter
  children?: React.ReactNode;
  className?: string;
}

export const SubscriptionFeatureLink = ({
  featureType,
  returnPath,
  referringPagePath,
  referringPageLabel,
  source, // Include source parameter
  children,
  className
}: SubscriptionFeatureLinkProps) => {
  const { trackEngagement, isElementProcessing, markElementProcessing } = useTracking();
  const trackingPromiseRef = useRef<Promise<void> | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      // Get the actual DOM element
      const element = e.currentTarget;
      
      // Stop propagation to prevent bubbling
      e.stopPropagation();
      
      // If this element is already being processed, prevent duplicate tracking
      if (isElementProcessing(element) || trackingPromiseRef.current) {
        console.log("[SubscriptionFeatureLink] Preventing duplicate click handling");
        return;
      }
      
      // Mark this element as being processed
      markElementProcessing(element, true);
      
      // Track the subscription feature link click
      trackingPromiseRef.current = trackEngagement('subscription_feature_click', {
        feature_type: featureType,
        referring_page: referringPagePath,
        return_path: returnPath,
        source: source || 'subscription_link' // Include source in tracking
      }, 'subscription');
      
      await trackingPromiseRef.current;
    } catch (error) {
      console.error('[SubscriptionFeatureLink] Error tracking click:', error);
    } finally {
      // Clear the tracking promise reference
      trackingPromiseRef.current = null;
      
      // Reset the processing state after a delay
      setTimeout(() => {
        if (e.currentTarget) {
          markElementProcessing(e.currentTarget, false);
        }
      }, 1000);
    }
  };

  return (
    <Link
      to="/subscription-features"
      state={{
        featureType,
        returnPath,
        referringPagePath,
        referringPageLabel,
        source: source || 'subscription_link' // Include source in navigation state
      }}
      className={className}
      onClick={handleClick}
    >
      <Button className="w-full">
        {children || "Learn about Premium Features"}
      </Button>
    </Link>
  );
};
