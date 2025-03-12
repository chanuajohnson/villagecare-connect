import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Updated type definition to include isLoggedIn
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isLoggedIn: false,
  userRole: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Loading timeout reference
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to set loading state with timeout safeguard
  const setLoadingWithTimeout = (loading: boolean, operation: string) => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Set the loading state
    setIsLoading(loading);

    // If starting a loading state, set a timeout to clear it
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        // Clear auth state to recover from potential stuck state
        if (operation.includes('sign-out') || operation.includes('fetch-session')) {
          localStorage.removeItem('supabase.auth.token');
          supabase.auth.signOut().catch(console.error);
        }
      }, 5000); // 5 second timeout
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      setLoadingWithTimeout(true, 'fetch-session');
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoadingWithTimeout(false, 'fetch-session');
      }
    };

    fetchSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event, session ? 'Has session' : 'No session');
      setLoadingWithTimeout(true, event);

      if (event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setUserRole(null);
        navigate('/auth');
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(session);
      }

      setLoadingWithTimeout(false, event);
    });
  }, [navigate]);

  const fetchUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserRole(null);
      } else {
        setUserRole(profile?.role || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserRole(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoadingWithTimeout(true, 'sign-in');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error);
        toast.error(error.message || 'Failed to sign in');
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchUserProfile(data.user);
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Sign-in error:', error.message);
    } finally {
      setLoadingWithTimeout(false, 'sign-in');
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoadingWithTimeout(true, 'sign-up');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('Sign-up error:', error);
        toast.error(error.message || 'Failed to sign up');
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchUserProfile(data.user);
        toast.success('Signed up successfully!');
      }
    } catch (error: any) {
      console.error('Sign-up error:', error.message);
    } finally {
      setLoadingWithTimeout(false, 'sign-up');
    }
  };

  const signOut = async () => {
    setLoadingWithTimeout(true, 'sign-out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign-out error:', error);
        toast.error(error.message || 'Failed to sign out');
      } else {
        setUser(null);
        setSession(null);
        setUserRole(null);
        toast.success('Signed out successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoadingWithTimeout(false, 'sign-out');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isLoggedIn: !!user,
    userRole,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
