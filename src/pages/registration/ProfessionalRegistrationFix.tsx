
// Import the new utility functions in the ProfessionalRegistration.tsx file
import { ensureUserProfile, updateUserProfile } from "@/utils/profile-utils";

// Then update the form submission handler:

const handleFormSubmit = async (formData: any) => {
  if (!user) {
    console.error('No user found. Please log in again.');
    toast.error('No user found. Please log in again.');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    console.log('Submitting professional profile data:', formData);
    
    // First ensure the profile exists
    const profileExists = await ensureUserProfile(
      user.id, 
      `${formData.firstName} ${formData.lastName}`.trim(),
      'professional'
    );
    
    if (!profileExists) {
      throw new Error('Failed to ensure profile exists');
    }
    
    // Create a properly structured data object
    const profileData = {
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      role: 'professional',
      // Add all other form fields...
      professional_type: formData.professionalType,
      years_of_experience: formData.yearsOfExperience,
      // ... (all other fields)
    };
    
    console.log('Formatted profile data for update:', profileData);
    
    // Update the profile
    const { success, error } = await updateUserProfile(user.id, profileData);
    
    if (!success) {
      throw new Error(error?.message || 'Failed to update professional profile');
    }
    
    console.log('Professional profile created/updated successfully');
    toast.success('Your professional profile has been created!');
    
    // Navigate to the professional dashboard
    navigate('/dashboard/professional');
  } catch (error: any) {
    console.error('Error in professional profile submission:', error);
    toast.error(`Error creating professional profile: ${error.message || 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};
