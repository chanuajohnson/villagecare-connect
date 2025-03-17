
import { ButtonHTMLAttributes, forwardRef, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTracking, TrackingActionType } from "@/hooks/useTracking";

interface TrackedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
export const TrackedButton = forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ trackingAction, trackingData = {}, featureName, onClick, ...props }, ref) => {
    const { trackEngagement, isElementProcessing, markElementProcessing } = useTracking();
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const trackingPromiseRef = useRef<Promise<void> | null>(null);
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        // Get the actual DOM element
        const element = e.currentTarget;
        
        // Stop propagation to prevent event bubbling
        e.stopPropagation();
        
        // If this element is already being processed or has a tracking promise in progress, prevent duplicate tracking
        if (isElementProcessing(element) || trackingPromiseRef.current) {
          console.log("[TrackedButton] Preventing duplicate click handling");
          return;
        }
        
        // Mark this element as being processed
        markElementProcessing(element, true);
        
        // Track the button click
        trackingPromiseRef.current = trackEngagement(trackingAction, trackingData, featureName);
        
        await trackingPromiseRef.current;
        
        // Call the original onClick handler if provided
        if (onClick) {
          onClick(e);
        }
      } catch (error) {
        console.error("[TrackedButton] Error handling click:", error);
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

TrackedButton.displayName = "TrackedButton";
