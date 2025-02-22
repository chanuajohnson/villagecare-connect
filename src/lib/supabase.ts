
import { createClient } from '@supabase/supabase-js';

// Create a dummy client when env vars aren't available
const createDummyClient = () => {
  return {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null })
    }
  } as any;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client if credentials are available, otherwise use dummy client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createDummyClient();

// Helper function to get user role
export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return data?.role;
};
