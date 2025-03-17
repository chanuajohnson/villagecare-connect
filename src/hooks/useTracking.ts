import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/components/providers/AuthProvider";

export type TrackingActionType = 
  // Page Views
  | 'landing_page_view'
  | 'auth_page_view'
  | 'dashboard_view'
  | 'family_dashboard_view'
  | 'professional_dashboard_view'
  | 'community_dashboard_view'
  | 'admin_dashboard_view'
  | 'caregiver_matching_page_view'
  | 'family_matching_page_view'
  | 'registration_page_view'
  | 'subscription_page_view'
  | 'features_page_view'
  | 'profile_page_view'
  
  // Authentication Actions
  | 'auth_login_attempt'
  | 'auth_signup_attempt'
  | 'auth_login_success'
  | 'auth_signup_success'
  | 'auth_logout'
  | 'auth_password_reset_request'
  
  // CTA Clicks
  | 'caregiver_matching_cta_click'
  | 'family_matching_cta_click'
  | 'premium_matching_cta_click'
  | 'subscription_cta_click'
  | 'complete_profile_cta_click'
  | 'unlock_profile_click'
  | 'view_all_matches_click'
  | 'podcast_playback_toggle'
  | 'podcast_subscribe_click'
  | 'training_enrollment_click'
  | 'training_module_start'
  
  // Feature Interactions
  | 'filter_toggle_click'
  | 'filter_change'
  | 'profile_view'
  | 'message_send'
  | 'feature_upvote'
  | 'training_module_complete'
  | 'lesson_complete'
  
  // Navigation
  | 'navigation_click'
  | 'breadcrumb_click'
  
  // Other
  | string; // Allow custom action types

export interface TrackingOptions {
  /**
   * Whether to disable tracking. Useful for testing environments.
   */
  disabled?: boolean;
  
  /**
   * Rate limit in milliseconds to prevent duplicate tracking events
   */
  rateLimit?: number;
}

// Create a map to track last event times for rate limiting
const lastEventTimeMap: Record<string, number> = {};

/**
 * Hook for tracking user engagement across the platform
 */
export function useTracking(options: TrackingOptions = {}) {
  const { user, isProfileComplete } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Default rate limit of 1000ms (1 second)
  const rateLimit = options.rateLimit ?? 1000;
  
  /**
   * Track a user engagement event
   * 
   * @param actionType The type of action being tracked
   * @param additionalData Optional additional data to store with the tracking event
   * @param featureName Optional feature name to override the default
   * @returns Promise that resolves when tracking is complete
   */
  const trackEngagement = async (
    actionType: TrackingActionType, 
    additionalData = {}, 
    featureName?: string
  ) => {
    // Skip tracking if disabled
    if (options.disabled) {
      console.log('[Tracking disabled]', actionType, additionalData);
      return;
    }
    
    // Implement rate limiting to prevent duplicate events
    const userId = user?.id || 'anonymous';
    const eventKey = `${userId}-${actionType}-${JSON.stringify(additionalData)}`;
    const now = Date.now();
    const lastEventTime = lastEventTimeMap[eventKey] || 0;
    
    // Skip if this exact event was tracked too recently
    if (now - lastEventTime < rateLimit) {
      console.log(`[Tracking] Skipping duplicate event (rate limited): ${actionType}`);
      return;
    }
    
    // Update the last event time
    lastEventTimeMap[eventKey] = now;
    
    try {
      setIsLoading(true);
      console.log(`[Tracking] Starting to track ${actionType}`, additionalData);
      
      // Get or create a session ID to track anonymous users
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      // Store the session ID if it's new
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      // Add user role to additional data if user is logged in
      const enhancedData = {
        ...additionalData,
        user_role: user?.role || 'anonymous',
        user_profile_complete: isProfileComplete || false,
      };
      
      console.log(`[Tracking] User ID: ${user?.id || 'anonymous'}, Session ID: ${sessionId}`);
      console.log(`[Tracking] Enhanced data:`, enhancedData);
      
      // Determine the feature name based on the action type
      let resolvedFeatureName = featureName;
      
      if (!resolvedFeatureName) {
        // Map action types to their corresponding features
        if (actionType.includes('podcast')) {
          resolvedFeatureName = 'podcast';
        } else if (actionType.includes('training')) {
          resolvedFeatureName = 'professional_training';
        } else {
          // Default fallback
          resolvedFeatureName = 'caregiver_matching';
        }
      }
      
      console.log(`[Tracking] Feature name: ${resolvedFeatureName}`);
      
      // Record the tracking event in Supabase
      const { data, error } = await supabase.from('cta_engagement_tracking').insert({
        user_id: user?.id || null,
        action_type: actionType,
        session_id: sessionId,
        feature_name: resolvedFeatureName,
        additional_data: enhancedData
      });
      
      if (error) {
        console.error("[Tracking Error] Error tracking engagement:", error);
        throw error;
      } else {
        console.log(`[Tracking Success] Tracked ${actionType} for ${user?.id || 'anonymous user'}`);
      }
      
      return data;
    } catch (error) {
      console.error("[Tracking Error] Error in trackEngagement:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    trackEngagement,
    isLoading
  };
}
