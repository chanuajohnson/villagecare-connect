
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardCardGrid } from '@/components/dashboard/DashboardCardGrid';
import { FamilyNextStepsPanel } from '@/components/family/FamilyNextStepsPanel';
import { DashboardCaregiverMatches } from '@/components/family/DashboardCaregiverMatches';
import { TrackableButton } from '@/components/tracking/TrackableButton';

const FamilyDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the user's care recipient profile if they have one
  const { data: careRecipient } = useQuery({
    queryKey: ['careRecipient', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('care_recipient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const makeAdmin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to set admin role');
      }
      
      toast.success('Admin role set successfully! Please sign out and sign back in to access admin features.');
      
      // Force sign out to refresh session
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to set admin role: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/family-dashboard" }
        ]}
      />
      
      {/* Admin conversion button - only visible for your specific user */}
      {user?.id === '7d850934-a44f-4348-944b-ae7182dca237' && userRole === 'family' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800">Administrator Access</h3>
          <p className="mb-3 text-yellow-700">
            You have been granted admin privileges. Click the button below to convert your account to an admin account.
            You'll need to sign out and sign back in after this change.
          </p>
          <TrackableButton
            onClick={makeAdmin}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            trackingAction="activate_admin_role"
            trackingData={{ category: "user_management" }}
          >
            {isLoading ? 'Processing...' : 'Activate Admin Role'}
          </TrackableButton>
        </div>
      )}
      
      {!careRecipient && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Share Your Loved One's Story</h3>
          <p className="mb-3 text-blue-700">
            Help us understand your loved one better by sharing their story.
            This helps us provide more personalized care recommendations.
          </p>
          <TrackableButton
            onClick={() => navigate('/family/story')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            trackingAction="tell_their_story"
            trackingData={{ category: "family_engagement" }}
          >
            Tell Their Story
          </TrackableButton>
        </div>
      )}
      
      <FamilyNextStepsPanel />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCaregiverMatches />
        </div>
        <div>
          <DashboardCardGrid />
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
