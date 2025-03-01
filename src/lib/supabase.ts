
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Constants for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cpdfmyemjrefnhddyrck.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

// Initialize the Supabase client with persistent session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
});

// Function to get user role from database
export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found when getting user role');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (err) {
    console.error('Error in getUserRole:', err);
    return null;
  }
};

// Ensure storage buckets exist - can be called at app initialization
export const ensureStorageBuckets = async () => {
  try {
    // Get the current session to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session) {
      console.log("No authenticated session found for storage operations");
      return;
    }
    
    // Check if avatars bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError);
      return;
    }
    
    const avatarsBucketExists = buckets.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log('Creating avatars bucket...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
      });
      
      if (createError) {
        console.error('Error creating avatars bucket:', createError);
      } else {
        console.log('Avatars bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking storage buckets:', error);
  }
};
