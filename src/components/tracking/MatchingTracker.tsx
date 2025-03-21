
import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export interface MatchingTrackerProps {
  currentPage: string;
}

export function MatchingTracker({ currentPage }: MatchingTrackerProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const trackMatchingView = async () => {
      try {
        await supabase.from('cta_engagement_tracking').insert({
          user_id: user.id,
          action_type: 'matching_view',
          additional_data: {
            page: currentPage,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error tracking matching view:', error);
      }
    };

    trackMatchingView();
  }, [user, currentPage]);

  return null;
}
