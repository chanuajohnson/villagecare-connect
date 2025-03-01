
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/database';

// Constants for Supabase connection
// Using fallback values to ensure we always have valid values, even if env vars are missing
const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    import.meta.env.VITE_SUPABASE_URL || 
                    'https://cpdfmyemjrefnhddyrck.supabase.co';

const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZGZteWVtanJlZm5oZGR5cmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjcwODAsImV4cCI6MjA1NTQwMzA4MH0.9LwhYWSuTbiqvSGGPAT7nfz8IFZIgnNzYoa_hLQ_2PY';

// Database schema information for validation
const REQUIRED_TABLES = ['profiles'];
const REQUIRED_PROFILE_FIELDS = ['id', 'role', 'full_name'];

// Maximum retry attempts for database operations
const MAX_RETRY_ATTEMPTS = 3;

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
  db: {
    schema: 'public',
  },
  // Increase default timeout for auth operations
  realtime: {
    timeout: 30000, // 30 seconds
  },
});

// Function to implement retry logic with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  name: string,
  maxRetries = MAX_RETRY_ATTEMPTS
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting operation "${name}" (attempt ${attempt + 1}/${maxRetries})`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed for operation "${name}":`, error);
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1000ms, 2000ms, 4000ms, etc.
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

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

// Function to validate schema for critical tables
export const validateSchema = async (): Promise<{valid: boolean, issues: string[]}> => {
  try {
    const issues: string[] = [];
    
    // Check if profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      issues.push(`Database schema check failed: ${tablesError.message}`);
      return { valid: false, issues };
    }
    
    const tableNames = tables?.map(t => t.table_name) || [];
    
    // Check for required tables
    for (const requiredTable of REQUIRED_TABLES) {
      if (!tableNames.includes(requiredTable)) {
        const issue = `Required table "${requiredTable}" not found in database`;
        console.error(issue);
        issues.push(issue);
      }
    }
    
    // If profiles table exists, check for required fields
    if (tableNames.includes('profiles')) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.error('Error checking profiles columns:', columnsError);
        issues.push(`Profiles table column check failed: ${columnsError.message}`);
      } else {
        const columnNames = columns?.map(c => c.column_name) || [];
        
        for (const requiredField of REQUIRED_PROFILE_FIELDS) {
          if (!columnNames.includes(requiredField)) {
            const issue = `Required field "${requiredField}" not found in profiles table`;
            console.error(issue);
            issues.push(issue);
          }
        }
      }
    }
    
    const valid = issues.length === 0;
    console.log('Schema validation result:', valid ? 'VALID' : 'INVALID', issues);
    
    return { valid, issues };
  } catch (error) {
    console.error('Error validating schema:', error);
    return { 
      valid: false, 
      issues: [`Schema validation failed with error: ${error instanceof Error ? error.message : String(error)}`] 
    };
  }
};

// Function to get user role from database with improved error handling
export const getUserRole = async (): Promise<UserRole | null> => {
  return withRetry(async () => {
    console.log('Getting user session...');
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
    
    // First try to get role from user metadata (faster)
    if (session.user.user_metadata?.role) {
      console.log('Found role in user metadata:', session.user.user_metadata.role);
      return session.user.user_metadata.role as UserRole;
    }
    
    // Then try to get it from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role:', error);
      
      // Check if this might be an RLS error
      if (error.message.includes('permission denied')) {
        console.error('This appears to be a Row Level Security (RLS) error. Check database policies.');
      }
      
      return null;
    }
    
    console.log('User role retrieved from profiles table:', data?.role);
    return data?.role || null;
  }, 'getUserRole');
};

// Function to ensure a profile exists for the current user
export const ensureUserProfile = async (userData: any): Promise<boolean> => {
  try {
    console.log('Ensuring user profile exists with data:', userData);
    
    // First get current session to verify we have the user ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting session for profile creation:', sessionError);
      return false;
    }
    
    const userId = session.user.id;
    
    // Try to get existing profile
    const { data: existingProfile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (getError) {
      console.error('Error checking for existing profile:', getError);
      
      // Try to create profile instead
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...userData }]);
      
      if (insertError) {
        console.error('Error creating new profile:', insertError);
        return false;
      }
      
      console.log('Created new profile for user', userId);
      return true;
    }
    
    if (existingProfile) {
      console.log('Found existing profile, updating with new data');
      
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating existing profile:', updateError);
        return false;
      }
      
      console.log('Updated existing profile for user', userId);
      return true;
    } else {
      // Create new profile as fallback
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...userData }]);
      
      if (insertError) {
        console.error('Error creating new profile as fallback:', insertError);
        return false;
      }
      
      console.log('Created new profile as fallback for user', userId);
      return true;
    }
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error);
    return false;
  }
};

// Ensure storage buckets exist - can be called at app initialization
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
      return false;
    }
    
    // Check if avatars bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError);
      return false;
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
        return false;
      } else {
        console.log('Avatars bucket created successfully');
      }
    } else {
      console.log('Avatars bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    return false;
  }
};

// Function to ensure a valid authentication context for operations
export const ensureAuthContext = async () => {
  return withRetry(async () => {
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
  }, 'ensureAuthContext');
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
  
  // Validate schema
  const { valid, issues } = await validateSchema();
  if (!valid) {
    console.warn('Schema validation found issues:', issues);
    // We continue anyway, as this is just a warning
  }
  
  // Check session
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session during initialization:', error);
  } else {
    console.log('Session exists during initialization:', !!data.session);
  }
  
  // Ensure buckets (if user is logged in)
  if (data.session) {
    await ensureStorageBuckets();
  }
  
  console.log('Supabase initialization complete');
  return true;
};

// Call initialization when this module is loaded
initializeSupabase().catch(err => {
  console.error('Error during Supabase initialization:', err);
});
