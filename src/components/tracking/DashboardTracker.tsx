
import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export interface DashboardTrackerProps {
  currentPage?: string; // Now optional with a default value
  dashboardType?: string;
  additionalData?: Record<string, any>;
}

export function DashboardTracker({ 
  currentPage = window.location.pathname, // Default to current path if not provided
  dashboardType, 
  additionalData 
}: DashboardTrackerProps) {
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
            dashboardType,
            ...(additionalData || {}),
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error tracking dashboard view:', error);
      }
    };

    trackDashboardView();
  }, [user, currentPage, dashboardType, additionalData]);

  return null;
}
