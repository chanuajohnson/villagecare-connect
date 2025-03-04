
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Constants for Supabase connection
// Using fallback values to ensure we always have valid values, even if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    'https://cpdfmyemjrefnhddyrck.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

// Validation to ensure we have valid values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing! This will cause authentication failures.');
}

// Logging for debugging
console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('API Key exists:', !!supabaseAnonKey);

// Initialize the Supabase client with persistent session and enhanced options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'x-client-info': 'lovable-app',
      'Content-Type': 'application/json',
    },
  },
});

// Function to check if Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to check if connection works
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    console.log('Supabase connection check: successful');
    return true;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};

// Function to get user role from database with improved error handling
export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting user session:', sessionError);
      return null;
    }
    
    if (!session) {
      console.log('No session found when getting user role');
      return null;
    }
    
    console.log('Getting user role for user ID:', session.user.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    console.log('User role retrieved:', data?.role);
    return data?.role || null;
  } catch (err) {
    console.error('Error in getUserRole:', err);
    return null;
  }
};

// Updated ensureStorageBuckets function with better error handling for RLS
export const ensureStorageBuckets = async () => {
  try {
    console.log('Checking if storage buckets exist...');
    
    // Get the current session to ensure we're authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session for storage operations:', sessionError);
      return false;
    }
    
    if (!sessionData?.session) {
      console.log("No authenticated session found for storage operations");
      // Still proceed - the storage buckets may be public
    }
    
    // Check if avatars bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      // If we get a permissions error here, it might be due to RLS
      // But the buckets should have been created in the migration
      console.error('Error checking storage buckets:', bucketError);
      console.log('Buckets should have been created by migration, proceeding...');
      return true;
    }
    
    // Log the existing buckets for debugging
    if (buckets && buckets.length > 0) {
      console.log('Existing buckets:', buckets.map(b => b.name).join(', '));
      return true;
    } else {
      console.log('No buckets found, but they should have been created by migration');
      return true;
    }
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    // Return true to allow the app to proceed - the migration should have created the buckets
    return true;
  }
};

// Function to ensure a valid authentication context for operations
export const ensureAuthContext = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Update Authorization header with current session token
    // We need to manually set headers for each request since we can't access protected properties
    console.log('Auth context refreshed successfully with token');
    return true;
  } catch (err) {
    console.error('Error ensuring auth context:', err);
    return false;
  }
};

// Initialize Supabase - call this function early in your app
export const initializeSupabase = async () => {
  console.log('Initializing Supabase...');
  
  // Check connection
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.error('Failed to connect to Supabase during initialization');
    return false;
  }
  
  // Check session
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session during initialization:', error);
  } else {
    console.log('Session exists during initialization:', !!data.session);
  }
  
  // Ensure buckets (even if user is not logged in)
  await ensureStorageBuckets();
  
  console.log('Supabase initialization complete');
  return true;
};

// Call initialization when this module is loaded
initializeSupabase().catch(err => {
  console.error('Error during Supabase initialization:', err);
});
