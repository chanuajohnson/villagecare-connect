
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types/database";

/**
 * Ensures a profile exists for the current user
 * This is a safety measure in case the DB trigger fails
 */
export const ensureUserProfile = async (
  userId: string, 
  fullName?: string, 
  role?: UserRole
): Promise<boolean> => {
  try {
    console.log('Ensuring profile exists for user:', userId);
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing profile:', checkError);
      throw checkError;
    }
    
    // If profile exists, return true
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return true;
    }
    
    // If no profile, create one
    console.log('No profile found, creating one for user:', userId);
    
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName || '',
        role: role || 'family' // Default to family if no role specified
      });
    
    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }
    
    console.log('Profile created successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Failed to ensure user profile:', error);
    return false;
  }
};

/**
 * Updates the user's profile with the provided data
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Record<string, any>
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Updating profile for user:', userId, 'with data:', profileData);
    
    // First ensure the profile exists
    await ensureUserProfile(userId);
    
    // Then update it
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
    
    console.log('Profile updated successfully for user:', userId);
    return { success: true };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return { success: false, error };
  }
};
