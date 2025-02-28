
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getUserRole } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';

// Define timeout duration for loading states (in milliseconds)
const LOADING_TIMEOUT_MS = 8000; // Increased from 5s to 8s to give more time for auth operations

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  requireAuth: (action: string, redirectPath?: string) => boolean;
  clearLastAction: () => void;
  checkPendingUpvote: () => Promise<void>;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: null,
  signOut: async () => {},
  isLoading: true,
  requireAuth: () => false,
  clearLastAction: () => {},
  checkPendingUpvote: async () => {},
  isProfileComplete: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add loading timeout reference
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track initialization
  const isInitializedRef = useRef(false);
  // Track if we're in the middle of redirecting
  const isRedirectingRef = useRef(false);

  // Helper to clear any existing timeouts
  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      console.log(`[AuthProvider] Clearing loading timeout`);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  // Helper to set loading state with timeout safeguard
  const setLoadingWithTimeout = (loading: boolean, operation: string) => {
    console.log(`[AuthProvider] ${loading ? 'START' : 'END'} loading state for: ${operation}`);
    
    // Clear any existing timeout
    clearLoadingTimeout();
    
    // Set the loading state
    setIsLoading(loading);
    
    // If we're starting a loading state, set a timeout to clear it
    if (loading) {
      console.log(`[AuthProvider] Setting loading timeout for: ${operation} (${LOADING_TIMEOUT_MS}ms)`);
      loadingTimeoutRef.current = setTimeout(() => {
        console.log(`[AuthProvider] TIMEOUT reached for: ${operation} - forcibly ending loading state`);
        setIsLoading(false);
        
        // Clear browser storage when timeout occurs to prevent persistence of stale data
        if (operation.includes('sign-out') || operation.includes('fetch-session')) {
          console.log('[AuthProvider] Clearing localStorage due to timeout');
          localStorage.removeItem('supabase.auth.token');
          try {
            // Try to sign out to reset all auth state
            supabase.auth.signOut().catch(console.error);
          } catch (error) {
            console.error('[AuthProvider] Error during forced signout:', error);
          }
          toast.error(`Authentication operation timed out. Please refresh the page and try again.`);
        }
      }, LOADING_TIMEOUT_MS);
    }
  };

  // Function to check if the user's profile is complete
  const checkProfileCompletion = async (userId: string) => {
    try {
      console.log('[AuthProvider] Checking profile completion for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[AuthProvider] Error checking profile completion:', error);
        throw error;
      }
      
      console.log('[AuthProvider] Profile data retrieved:', profile);
      
      // Profile is considered complete if they have at least a full name
      const profileComplete = profile && !!profile.full_name;
      setIsProfileComplete(profileComplete);
      console.log('[AuthProvider] Profile complete:', profileComplete);
      return profileComplete;
    } catch (error) {
      console.error('[AuthProvider] Error checking profile completion:', error);
      return false;
    }
  };

  // Function to handle pending feature upvotes after login
  const checkPendingUpvote = async () => {
    const featureId = localStorage.getItem('pendingFeatureUpvote');
    
    if (featureId && user) {
      try {
        // Check if user has already voted for this feature
        const { data: existingVote, error: checkError } = await supabase
          .from('feature_upvotes')
          .select('id')
          .eq('feature_id', featureId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        // If user hasn't voted yet, add the vote
        if (!existingVote) {
          const { error: voteError } = await supabase
            .from('feature_upvotes')
            .insert([{
              feature_id: featureId,
              user_id: user.id
            }]);
          
          if (voteError) throw voteError;
          
          toast.success('Your vote has been recorded!');
        } else {
          toast.info('You have already voted for this feature');
        }
        
        // Remove the pending vote from local storage
        localStorage.removeItem('pendingFeatureUpvote');
        
        // Redirect to the features page
        navigate('/features');
      } catch (error: any) {
        console.error('[AuthProvider] Error handling pending upvote:', error);
        toast.error(error.message || 'Failed to process your vote');
      }
    }
  };

  // Function to handle redirections after authentication
  const handlePostLoginRedirection = async () => {
    if (!user || isRedirectingRef.current) return;
    
    // Mark that we're in the middle of redirecting to prevent duplicate redirects
    isRedirectingRef.current = true;
    
    try {
      console.log('[AuthProvider] Handling post-login redirection for user:', user.id);
      console.log('[AuthProvider] Current user role:', userRole);
      
      // Check if the user has completed their profile
      const profileComplete = await checkProfileCompletion(user.id);
      console.log('[AuthProvider] Profile complete:', profileComplete);
      
      // List of possible actions stored in localStorage
      const pendingActions = [
        'pendingFeatureUpvote',
        'pendingBooking',
        'pendingMessage',
        'pendingProfileUpdate'
      ];
      
      // Check if any of these actions exist in localStorage
      const hasPendingAction = pendingActions.some(action => localStorage.getItem(action));
      console.log('[AuthProvider] Has pending action:', hasPendingAction);
      
      // If the user hasn't completed their profile and there are no pending actions,
      // redirect to the appropriate registration page
      if (!profileComplete && !hasPendingAction) {
        if (userRole) {
          const registrationRoutes: Record<UserRole, string> = {
            'family': '/registration/family',
            'professional': '/registration/professional',
            'community': '/registration/community',
            'admin': '/dashboard/admin' // Admin users don't need registration
          };
          
          const route = registrationRoutes[userRole];
          console.log('[AuthProvider] Redirecting to registration page:', route);
          toast.info('Please complete your profile to continue');
          navigate(route);
          return;
        }
      }
      
      // Handle feature upvote if present
      const pendingFeatureUpvote = localStorage.getItem('pendingFeatureUpvote');
      if (pendingFeatureUpvote) {
        await checkPendingUpvote();
        return;
      }
      
      // Handle pending booking if present
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        localStorage.removeItem('pendingBooking');
        navigate(pendingBooking);
        return;
      }
      
      // Handle pending message if present
      const pendingMessage = localStorage.getItem('pendingMessage');
      if (pendingMessage) {
        localStorage.removeItem('pendingMessage');
        navigate(pendingMessage);
        return;
      }
      
      // Handle pending profile update if present
      const pendingProfileUpdate = localStorage.getItem('pendingProfileUpdate');
      if (pendingProfileUpdate) {
        localStorage.removeItem('pendingProfileUpdate');
        navigate(pendingProfileUpdate);
        return;
      }
      
      // If user has completed profile and there are no pending actions
      // Check for last path and redirect there if it exists
      const lastPath = localStorage.getItem('lastPath');
      console.log('[AuthProvider] Last path:', lastPath);
      
      if (profileComplete && lastPath) {
        console.log('[AuthProvider] Navigating to last path:', lastPath);
        navigate(lastPath);
        clearLastAction();
      } else if (profileComplete) {
        // If no last path but profile is complete, redirect to the appropriate dashboard
        if (userRole) {
          const dashboardRoutes: Record<UserRole, string> = {
            'family': '/dashboard/family',
            'professional': '/dashboard/professional',
            'community': '/dashboard/community',
            'admin': '/dashboard/admin'
          };
          
          console.log('[AuthProvider] Navigating to dashboard for role:', userRole);
          navigate(dashboardRoutes[userRole]);
          toast.success(`Welcome to your ${userRole} dashboard!`); // Welcome message on successful login
        }
      } else {
        // If we get here and the profile is not complete but we didn't redirect to registration,
        // we should force a redirect to the appropriate dashboard
        if (userRole) {
          const dashboardRoutes: Record<UserRole, string> = {
            'family': '/dashboard/family',
            'professional': '/dashboard/professional',
            'community': '/dashboard/community',
            'admin': '/dashboard/admin'
          };
          
          console.log('[AuthProvider] Forcing navigation to dashboard for role:', userRole);
          navigate(dashboardRoutes[userRole]);
          toast.success(`Welcome to your ${userRole} dashboard!`); // Welcome message on successful login
        }
      }
    } catch (error) {
      console.error('[AuthProvider] Error during post-login redirection:', error);
    } finally {
      // Reset the redirecting flag
      isRedirectingRef.current = false;
    }
  };

  // Function to require authentication for specific actions
  const requireAuth = (action: string, redirectPath?: string) => {
    if (user) return true;

    // Store the last action and current path
    localStorage.setItem('lastAction', action);
    localStorage.setItem('lastPath', redirectPath || location.pathname + location.search);
    
    // Store specific actions in localStorage for post-login handling
    if (action.startsWith('upvote "')) {
      const featureId = localStorage.getItem('pendingFeatureId');
      if (featureId) {
        localStorage.setItem('pendingFeatureUpvote', featureId);
      }
    } else if (action.startsWith('book care')) {
      localStorage.setItem('pendingBooking', redirectPath || location.pathname);
    } else if (action.startsWith('send message')) {
      localStorage.setItem('pendingMessage', redirectPath || location.pathname);
    } else if (action.startsWith('update profile')) {
      localStorage.setItem('pendingProfileUpdate', redirectPath || location.pathname);
    }
    
    toast.error('Please sign in to ' + action);
    navigate('/auth');
    return false;
  };

  // Function to clear the last action after completion
  const clearLastAction = () => {
    localStorage.removeItem('lastAction');
    localStorage.removeItem('lastPath');
    localStorage.removeItem('pendingFeatureId');
    localStorage.removeItem('pendingFeatureUpvote');
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingMessage');
    localStorage.removeItem('pendingProfileUpdate');
  };

  // Function to initialize authentication state
  const fetchSessionAndUser = async () => {
    try {
      console.log('[AuthProvider] Fetching session and user...');
      setLoadingWithTimeout(true, 'fetch-session');
      
      // Directly request the current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthProvider] Error fetching session:', error);
        setLoadingWithTimeout(false, 'fetch-session-error');
        return;
      }
      
      console.log('[AuthProvider] Session retrieved:', currentSession ? 'Session exists' : 'No session');
      
      // Update state with session data
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        console.log('[AuthProvider] User found in session:', currentSession.user.id);
        // Get user role from profiles table
        const role = await getUserRole();
        console.log('[AuthProvider] User role:', role);
        setUserRole(role);
        
        // Check profile completion
        await checkProfileCompletion(currentSession.user.id);
      } else {
        console.log('[AuthProvider] No user in session');
        setUserRole(null);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error('[AuthProvider] Unexpected error in fetchSessionAndUser:', error);
    } finally {
      console.log('[AuthProvider] Session fetch complete, setting isLoading to false');
      setLoadingWithTimeout(false, 'fetch-session-complete');
      isInitializedRef.current = true;
    }
  };
  
  // Effect to handle post-login redirection when user/role is set
  useEffect(() => {
    if (user && userRole && isInitializedRef.current) {
      console.log('[AuthProvider] User and role available, handling redirection');
      handlePostLoginRedirection();
    }
  }, [user, userRole]);

  // Force clear stale auth state when component mounts if previous state was problematic
  useEffect(() => {
    const clearStaleState = async () => {
      // If we're coming from a problematic state (from localStorage marker)
      const hadAuthError = localStorage.getItem('authStateError');
      if (hadAuthError) {
        console.log('[AuthProvider] Detected previous auth error, clearing state');
        localStorage.removeItem('authStateError');
        
        try {
          await supabase.auth.signOut();
          // Clear all potential error state
          setSession(null);
          setUser(null);
          setUserRole(null);
          setIsProfileComplete(false);
          localStorage.removeItem('supabase.auth.token');
        } catch (e) {
          console.error('[AuthProvider] Error clearing stale auth state:', e);
        }
      }
    };
    
    clearStaleState();
    
    // Add cleanup for the loading timeout on unmount
    return () => {
      clearLoadingTimeout();
    };
  }, []);

  useEffect(() => {
    // Fetch initial session
    console.log('[AuthProvider] Initial auth check started');
    fetchSessionAndUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, newSession ? 'Has session' : 'No session');
      
      try {
        // Update state with new session
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('[AuthProvider] User signed in or token refreshed');
          setLoadingWithTimeout(true, `auth-state-change-${event}`);
          
          if (newSession?.user) {
            console.log('[AuthProvider] Getting role for signed in user...');
            const role = await getUserRole();
            console.log('[AuthProvider] User role from auth state change:', role);
            setUserRole(role);
            
            if (event === 'SIGNED_IN') {
              console.log('[AuthProvider] Processing post-signin actions');
              toast.success('You have successfully logged in!');
              // Don't call handlePostLoginRedirection here - it will be triggered by the effect
              // that watches for user and userRole changes
            }
          }
          
          // Make sure to turn off loading state
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] User signed out');
          setLoadingWithTimeout(true, 'auth-state-change-SIGNED_OUT');
          setUserRole(null);
          setIsProfileComplete(false);
          
          // Clear any potential error markers
          localStorage.removeItem('authStateError');
          
          // Clear browser storage
          localStorage.removeItem('supabase.auth.token');
          
          toast.success('You have been signed out successfully');
          navigate('/');
          
          // Make sure to turn off loading state
          setLoadingWithTimeout(false, 'auth-state-change-complete-SIGNED_OUT');
        } else if (event === 'USER_UPDATED') {
          console.log('[AuthProvider] User updated');
          if (newSession?.user) {
            const role = await getUserRole();
            setUserRole(role);
          }
          
          // Make sure to turn off loading state
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        } else {
          // For any other events, make sure loading state is turned off
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        }
      } catch (error) {
        console.error('[AuthProvider] Error handling auth state change:', error);
        // Mark that we encountered an auth error for recovery on next load
        localStorage.setItem('authStateError', 'true');
        setLoadingWithTimeout(false, `auth-state-change-error-${event}`);
      }
    });

    return () => {
      console.log('[AuthProvider] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      console.log('[AuthProvider] Signing out...');
      setLoadingWithTimeout(true, 'sign-out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthProvider] Sign out error:', error);
        throw error;
      }
      
      // Clear user state immediately
      setSession(null);
      setUser(null);
      setUserRole(null);
      
      // Clear any data in localStorage related to auth
      localStorage.removeItem('supabase.auth.token');
      
      navigate('/');
      toast.success('You have been signed out successfully');
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error);
      toast.error('Failed to sign out');
      
      // Force reset session state to prevent being stuck
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsLoading(false);
      
      // Mark that we encountered an auth error for recovery on next load
      localStorage.setItem('authStateError', 'true');
    } finally {
      console.log('[AuthProvider] Sign out complete, setting isLoading to false');
      setLoadingWithTimeout(false, 'sign-out-complete');
    }
  };

  console.log('[AuthProvider] Render state:', { 
    hasSession: !!session, 
    hasUser: !!user, 
    userRole, 
    isLoading,
    isProfileComplete
  });

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      signOut, 
      isLoading,
      requireAuth,
      clearLastAction,
      checkPendingUpvote,
      isProfileComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
