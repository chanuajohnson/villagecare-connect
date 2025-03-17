
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
    // Prevent duplicate tracking during processing
    if (processingRef.current) return;
    
    processingRef.current = true;
    
    try {
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
      
      // Track the link click
      await trackEngagement(trackingAction, {
        ...trackingData,
        destination: to.toString()
      }, featureName);
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => {
        processingRef.current = false;
      }, 300);
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
