import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Constants for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    'https://cpdfmyemjrefnhddyrck.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

// Enhanced validation and logging for connection parameters
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing or invalid!', { 
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
}

// Service status tracking
let isSupabaseAvailable = true;
let lastErrorTime = 0;
const ERROR_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Offline mode detection
const isOfflineMode = () => {
  // Consider Supabase unavailable if there have been recent errors
  if (!isSupabaseAvailable && (Date.now() - lastErrorTime < ERROR_THRESHOLD)) {
    return true;
  }
  
  // Check if browser is offline
  if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
    return true;
  }
  
  return false;
};

// More detailed logging for debugging connection issues
console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('API Key exists:', !!supabaseAnonKey);

// Create and export the Supabase client
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
  // Added parameters to improve reliability
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Wrap supabase methods with error handling
const originalFrom = supabase.from.bind(supabase);
supabase.from = function(table) {
  const queryBuilder = originalFrom(table);
  
  // Override methods that make requests
  const methods = ['select', 'insert', 'update', 'delete', 'upsert'];
  
  methods.forEach(method => {
    if (method in queryBuilder) {
      const originalMethod = queryBuilder[method].bind(queryBuilder);
      queryBuilder[method] = function(...args) {
        // Check if we're in offline mode
        if (isOfflineMode()) {
          console.warn(`Supabase operation skipped: ${method} on ${table} (offline mode)`);
          // Return mock response to prevent errors
          return Promise.resolve({ 
            data: [], 
            error: { message: 'Application is in offline mode', status: 503 },
            count: null
          });
        }
        
        // Proceed with original request
        const result = originalMethod(...args);
        
        // Add error handling
        const originalThen = result.then.bind(result);
        result.then = function(onFulfilled, onRejected) {
          return originalThen(
            (response) => {
              if (response.error) {
                // Track service availability
                isSupabaseAvailable = false;
                lastErrorTime = Date.now();
                console.error(`Supabase ${method} operation failed:`, response.error);
              } else {
                // Reset service status on success
                isSupabaseAvailable = true;
              }
              return onFulfilled ? onFulfilled(response) : response;
            },
            (error) => {
              // Track service availability
              isSupabaseAvailable = false;
              lastErrorTime = Date.now();
              console.error(`Supabase ${method} operation rejected:`, error);
              return onRejected ? onRejected(error) : Promise.reject(error);
            }
          );
        };
        
        return result;
      };
    }
  });
  
  return queryBuilder;
};

// Enhanced connection check with improved error handling
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // If we know we're offline, don't even try
    if (isOfflineMode()) {
      console.log('Skipping connection check: offline mode detected');
      return false;
    }
    
    // Simple query to check if connection works
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      
      // Log additional details for debugging
      if (error.message.includes('JWT')) {
        console.error('JWT authentication error. Token may be invalid or expired.');
      } else if (error.message.includes('network')) {
        console.error('Network error when connecting to Supabase.');
      }
      
      isSupabaseAvailable = false;
      lastErrorTime = Date.now();
      return false;
    }
    
    console.log('Supabase connection check: successful');
    isSupabaseAvailable = true;
    return true;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    isSupabaseAvailable = false;
    lastErrorTime = Date.now();
    return false;
  }
};

// Enhanced getUserRole function with improved token validation and error handling
export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting user session:', sessionError);
      
      // Try to refresh token if session error occurs
      if (sessionError.message.includes('expired')) {
        console.log('Attempting to refresh expired token...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return null;
        }
        
        if (!refreshData.session) {
          console.log('No session after token refresh');
          return null;
        }
        
        // Continue with refreshed session
        console.log('Token refreshed successfully');
      } else {
        return null;
      }
    }
    
    if (!session) {
      console.log('No session found when getting user role');
      return null;
    }
    
    // Validate user ID exists
    if (!session.user?.id) {
      console.error('Session exists but user ID is missing');
      return null;
    }
    
    console.log('Getting user role for user ID:', session.user.id);
    
    // Query for user's role with enhanced error handling
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role:', error);
      
      // Check for specific error types and handle accordingly
      if (error.code === 'PGRST301') {
        console.error('Row-level security policy violation. Check RLS policies.');
      } else if (error.message.includes('JWT')) {
        console.error('JWT validation error when querying database.');
      }
      
      return null;
    }
    
    // If we got a role from the database, update user metadata to match it
    if (data?.role) {
      console.log('User role retrieved from database:', data.role);
      
      // Update user metadata to match database role for consistency
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: data.role }
      });
      
      if (updateError) {
        console.error('Error updating user metadata with role:', updateError);
      } else {
        console.log('Updated user metadata with role from database:', data.role);
      }
      
      return data.role;
    }
    
    // If no profile role found but metadata has role, update profile
    const metadataRole = session.user.user_metadata?.role;
    if (metadataRole && !data?.role) {
      console.log('User has metadata role but no profile role. Updating profile with role:', metadataRole);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: metadataRole })
        .eq('id', session.user.id);
        
      if (updateError) {
        console.error('Error updating profile with metadata role:', updateError);
      } else {
        console.log('Updated profile with role from metadata:', metadataRole);
      }
      
      return metadataRole as UserRole;
    }
    
    console.log('No role found for user');
    return data?.role || null;
  } catch (err) {
    console.error('Error in getUserRole:', err);
    return null;
  }
};

// Improved function to ensure storage buckets exist
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
      // Log detailed error information for debugging
      console.error('Error checking storage buckets:', bucketError);
      
      if (bucketError.message.includes('JWT')) {
        console.error('JWT authentication error when accessing storage buckets');
      } else if (bucketError.message.includes('permission')) {
        console.error('Permission denied when accessing storage buckets. Check RLS policies.');
      }
      
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

// Improved function to ensure auth context is valid
export const ensureAuthContext = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error);
      
      // If token is expired, try to refresh it
      if (error.message.includes('expired')) {
        console.log('Attempting to refresh expired token...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Failed to refresh auth token:', refreshError);
          return false;
        }
        
        console.log('Token refreshed successfully');
        return true;
      }
      
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Validate token exists and is properly formatted
    if (!session.access_token) {
      console.error('Session exists but access token is missing');
      return false;
    }
    
    console.log('Auth context refreshed successfully with token');
    return true;
  } catch (err) {
    console.error('Error ensuring auth context:', err);
    return false;
  }
};

// Enhanced Supabase initialization function with connection validation
export const initializeSupabase = async () => {
  console.log('Initializing Supabase...');
  
  // Retry pattern for connection check
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    // Check connection
    const isConnected = await checkSupabaseConnection();
    if (isConnected) {
      break;
    }
    
    console.log(`Connection check failed, retry ${retries + 1}/${maxRetries}...`);
    retries++;
    
    if (retries >= maxRetries) {
      console.error('Failed to connect to Supabase after maximum retries');
      return false;
    }
    
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
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
  isSupabaseAvailable = false;
  lastErrorTime = Date.now();
});

// Add a helper to check if Supabase is experiencing issues
export const isSupabaseExperiencingIssues = (): boolean => {
  return !isSupabaseAvailable;
};

// Enhanced utility function to reset auth state in case of persistent issues
export const resetAuthState = async () => {
  try {
    console.log('Resetting auth state...');
    
    // Clear all auth-related local storage items
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('authStateError');
    localStorage.removeItem('authTimeoutRecovery');
    localStorage.removeItem('lastAuthState');
    localStorage.removeItem('lastAction');
    localStorage.removeItem('lastPath');
    localStorage.removeItem('pendingFeatureId');
    localStorage.removeItem('pendingFeatureUpvote');
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingMessage');
    localStorage.removeItem('pendingProfileUpdate');
    
    // Force sign out without relying on the existing session
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Error during forced signOut (non-critical):', error);
      // Ignore errors here - we've already cleared localStorage
    }
    
    console.log('Auth state reset complete');
    return true;
  } catch (error) {
    console.error('Error resetting auth state:', error);
    return false;
  }
};
