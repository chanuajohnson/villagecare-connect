
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
  const { trackEngagement } = useTracking();
  const processingRef = useRef(false);
  
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Stop tracking event if already processing
    if (processingRef.current) {
      return;
    }
    
    // Prevent nested tracking events
    e.stopPropagation();
    
    processingRef.current = true;
    
    try {
      // Track the link click
      await trackEngagement(trackingAction, {
        ...trackingData,
        destination: to.toString()
      }, featureName);
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => {
        processingRef.current = false;
      }, 500); // Increased timeout to prevent rapid re-clicks
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
