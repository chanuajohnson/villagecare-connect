
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
    const { trackEngagement, isElementProcessing, markElementProcessing } = useTracking();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Get the actual DOM element
      const element = e.currentTarget;
      
      // If this element is already being processed, prevent duplicate tracking
      if (isElementProcessing(element)) {
        console.log("[TrackableButton] Preventing duplicate click handling");
        return;
      }
      
      try {
        // Prevent event bubbling to avoid triggering parent click handlers
        e.stopPropagation();
        
        // Mark this element as being processed
        markElementProcessing(element, true);
        
        // Track the button click
        await trackEngagement(trackingAction, trackingData, featureName);
        
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
    
    // Combine the refs
    const setRefs = (element: HTMLButtonElement) => {
      buttonRef.current = element;
      
      // Handle the forwarded ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };
    
    return (
      <Button
        ref={setRefs}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

TrackableButton.displayName = "TrackableButton";
