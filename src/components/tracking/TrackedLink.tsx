
import { ReactNode, useRef } from "react";
import { Link, LinkProps } from "react-router-dom";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";

interface TrackedLinkProps extends LinkProps {
  /**
   * The action type to track when this link is clicked
   */
  trackingAction: TrackingActionType;
  
  /**
   * Additional data to include with the tracking event
   */
  trackingData?: Record<string, any>;
  
  /**
   * Optional feature name to categorize this tracking event
   */
  featureName?: string;
  
  /**
   * Children to render inside the link
   */
  children: ReactNode;
}

/**
 * Link component that automatically tracks click events
 */
export const TrackedLink = ({ 
  trackingAction, 
  trackingData = {}, 
  featureName,
  onClick,
  children,
  to,
  ...props 
}: TrackedLinkProps) => {
  const { trackEngagement, isElementProcessing, markElementProcessing } = useTracking();
  const trackingPromiseRef = useRef<Promise<void> | null>(null);
  
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      // Get the actual DOM element
      const element = e.currentTarget;
      
      // Stop propagation to prevent event bubbling
      e.stopPropagation();
      
      // If this element is already being processed or has a tracking promise in progress, prevent duplicate tracking
      if (isElementProcessing(element) || trackingPromiseRef.current) {
        console.log("[TrackedLink] Preventing duplicate click handling");
        return;
      }
      
      // Mark this element as being processed
      markElementProcessing(element, true);
      
      // Track the link click with destination information
      trackingPromiseRef.current = trackEngagement(trackingAction, {
        ...trackingData,
        destination: to.toString()
      }, featureName);
      
      await trackingPromiseRef.current;
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error("[TrackedLink] Error handling click:", error);
    } finally {
      // Clear the tracking promise reference
      trackingPromiseRef.current = null;
      
      // Clear the processing state after a short delay
      setTimeout(() => {
        if (e.currentTarget) {
          markElementProcessing(e.currentTarget, false);
        }
      }, 1000); // 1 second delay
    }
  };
  
  return (
    <Link
      to={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};
