
import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export interface DashboardTrackerProps {
  currentPage: string;
}

export function DashboardTracker({ currentPage }: DashboardTrackerProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const trackDashboardView = async () => {
      try {
        await supabase.from('cta_engagement_tracking').insert({
          user_id: user.id,
          action_type: 'dashboard_view',
          additional_data: {
            page: currentPage,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error tracking dashboard view:', error);
      }
    };

    trackDashboardView();
  }, [user, currentPage]);

  return null;
}
