import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get the user's role from their profile
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // First check if role is in the user's metadata
    if (user.user_metadata?.role) {
      return user.user_metadata.role as UserRole;
    }

    // If not found in metadata, check the profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return profile?.role as UserRole || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

// Add more Supabase utility functions as needed
