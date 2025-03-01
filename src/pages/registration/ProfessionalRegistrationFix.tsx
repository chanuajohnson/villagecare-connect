
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { ensureUserProfile, updateUserProfile } from '@/lib/profile-utils';

export default function SubmitProfessionalProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!user) {
      toast.error("You must be logged in to complete registration");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting professional profile with form data:', formData);
      
      // Ensure the profile exists first
      const profileResult = await ensureUserProfile(user.id);
      if (!profileResult.success) {
        throw new Error(profileResult.error || "Failed to ensure user profile exists");
      }
      
      console.log('Profile ensured, now updating with professional details');
      
      // Update with professional-specific fields
      const updateResult = await updateUserProfile(user.id, {
        role: 'professional',
        ...formData
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update professional profile");
      }
      
      console.log('Professional profile created successfully');
      
      // Check if a session exists after profile creation to confirm authentication context
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session validation failed after profile update:', sessionError);
        throw new Error(`Authentication context issue: ${sessionError?.message || "No active session"}`);
      }
      
      toast.success("Professional profile created successfully!");
      
      // Redirect to professional dashboard
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error('Error in professional profile submission:', error);
      toast.error(`Error creating professional profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render the form UI here with onSubmit={handleSubmit} */}
      <p>Professional registration form would go here</p>
      <button 
        onClick={() => handleSubmit({ professionalType: 'HHA' })} 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Profile'}
      </button>
    </div>
  );
}
