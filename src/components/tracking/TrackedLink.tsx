
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
  
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Get the actual DOM element
    const element = e.currentTarget;
    
    // If this element is already being processed, prevent duplicate tracking
    if (isElementProcessing(element)) {
      console.log("[TrackedLink] Preventing duplicate click handling");
      return;
    }
    
    try {
      // Stop propagation to prevent bubbling
      e.stopPropagation();
      
      // Mark this element as being processed
      markElementProcessing(element, true);
      
      // Track the link click with destination information
      await trackEngagement(trackingAction, {
        ...trackingData,
        destination: to.toString()
      }, featureName);
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    } finally {
      // Clear the processing state after a short delay
      setTimeout(() => {
        markElementProcessing(element, false);
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
