
import { ButtonHTMLAttributes, forwardRef, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";

interface TrackableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The action type to track when this button is clicked
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
   * Variant for the underlying Button component
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Size for the underlying Button component
   */
  size?: "default" | "sm" | "lg" | "icon";
  
  /**
   * Children to render inside the button
   */
  children: React.ReactNode;
}

/**
 * Button component that automatically tracks click events
 */
export const TrackableButton = forwardRef<HTMLButtonElement, TrackableButtonProps>(
  ({ trackingAction, trackingData = {}, featureName, onClick, ...props }, ref) => {
    const { trackEngagement } = useTracking();
    const processingRef = useRef(false);
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Stop tracking event if already processing
      if (processingRef.current) {
        return;
      }
      
      // Prevent default behavior and stop propagation to avoid nested tracking
      e.stopPropagation();
      
      processingRef.current = true;
      
      try {
        // Track the button click
        await trackEngagement(trackingAction, trackingData, featureName);
        
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
      <Button
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

TrackableButton.displayName = "TrackableButton";
