
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getUserRole } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';

// Define timeout duration for loading states (in milliseconds)
const LOADING_TIMEOUT_MS = 10000; // Reduced to 10s to avoid long waits

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
  
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const isRedirectingRef = useRef(false);
  const isSigningOutRef = useRef(false);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      console.log(`[AuthProvider] Clearing loading timeout`);
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const setLoadingWithTimeout = (loading: boolean, operation: string) => {
    console.log(`[AuthProvider] ${loading ? 'START' : 'END'} loading state for: ${operation}`);
    
    clearLoadingTimeout();
    
    setIsLoading(loading);
    
    if (loading) {
      console.log(`[AuthProvider] Setting loading timeout for: ${operation} (${LOADING_TIMEOUT_MS}ms)`);
      loadingTimeoutRef.current = setTimeout(() => {
        console.log(`[AuthProvider] TIMEOUT reached for: ${operation} - forcibly ending loading state`);
        setIsLoading(false);
        
        if (operation.includes('sign-out') || operation.includes('fetch-session')) {
          console.log('[AuthProvider] Clearing auth state due to timeout');
          
          try {
            // Reset local state regardless of Supabase signOut success
            setSession(null);
            setUser(null);
            setUserRole(null);
            
            if (isSigningOutRef.current) {
              isSigningOutRef.current = false;
              navigate('/');
              toast.success('You have been signed out successfully');
            }
            
            // Try to sign out from Supabase, but don't wait for it
            supabase.auth.signOut().catch(err => console.error('[AuthProvider] Error during forced signout:', err));
          } catch (error) {
            console.error('[AuthProvider] Error during forced signout:', error);
          }
          
          if (!location.pathname.includes('/auth')) {
            toast.error(`Authentication operation timed out. Please refresh the page and try again.`);
          }
        }
      }, LOADING_TIMEOUT_MS);
    }
  };

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
      
      const profileComplete = profile && !!profile.full_name;
      setIsProfileComplete(profileComplete);
      console.log('[AuthProvider] Profile complete:', profileComplete);
      return profileComplete;
    } catch (error) {
      console.error('[AuthProvider] Error checking profile completion:', error);
      return false;
    }
  };

  const checkPendingUpvote = async () => {
    const pendingFeatureId = localStorage.getItem('pendingFeatureId') || localStorage.getItem('pendingFeatureUpvote');
    
    if (pendingFeatureId && user) {
      try {
        console.log(`[AuthProvider] Processing pending upvote for feature: ${pendingFeatureId}`);
        
        const { data: existingVote, error: checkError } = await supabase
          .from('feature_upvotes')
          .select('id')
          .eq('feature_id', pendingFeatureId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (checkError) {
          console.error('[AuthProvider] Error checking existing vote:', checkError);
          throw checkError;
        }
        
        if (!existingVote) {
          const { error: voteError } = await supabase
            .from('feature_upvotes')
            .insert([{
              feature_id: pendingFeatureId,
              user_id: user.id
            }]);
          
          if (voteError) {
            console.error('[AuthProvider] Error recording vote:', voteError);
            throw voteError;
          }
          
          toast.success('Your vote has been recorded!');
        } else {
          toast.info('You have already voted for this feature');
        }
        
        localStorage.removeItem('pendingFeatureId');
        localStorage.removeItem('pendingFeatureUpvote');
        
        navigate('/dashboard/family');
      } catch (error: any) {
        console.error('[AuthProvider] Error handling pending upvote:', error);
        toast.error(error.message || 'Failed to process your vote');
      }
    }
  };

  const handlePostLoginRedirection = async () => {
    if (!user || isRedirectingRef.current) return;
    
    isRedirectingRef.current = true;
    
    try {
      console.log('[AuthProvider] Handling post-login redirection for user:', user.id);
      console.log('[AuthProvider] Current user role:', userRole);
      
      const profileComplete = await checkProfileCompletion(user.id);
      console.log('[AuthProvider] Profile complete:', profileComplete);
      
      const pendingActions = [
        'pendingFeatureId',
        'pendingFeatureUpvote',
        'pendingBooking',
        'pendingMessage',
        'pendingProfileUpdate'
      ];
      
      const hasPendingAction = pendingActions.some(action => localStorage.getItem(action));
      console.log('[AuthProvider] Has pending action:', hasPendingAction);
      
      // Check current location to avoid redirect loops
      const isOnRegistrationPage = location.pathname.includes('/registration/');
      
      // Force registration completion if profile is incomplete
      if (!profileComplete && !isOnRegistrationPage) {
        if (userRole) {
          const registrationRoutes: Record<UserRole, string> = {
            'family': '/registration/family',
            'professional': '/registration/professional',
            'community': '/registration/community',
            'admin': '/dashboard/admin'
          };
          
          const route = registrationRoutes[userRole];
          console.log('[AuthProvider] Redirecting to registration page:', route);
          toast.info('Please complete your profile to continue');
          navigate(route);
          return;
        }
      }
      
      // If we're already on a registration page and profile is incomplete, don't redirect elsewhere
      if (!profileComplete && isOnRegistrationPage) {
        isRedirectingRef.current = false;
        return;
      }
      
      // Handle pending actions only if profile is complete
      if (profileComplete) {
        const pendingFeatureId = localStorage.getItem('pendingFeatureId') || localStorage.getItem('pendingFeatureUpvote');
        if (pendingFeatureId) {
          await checkPendingUpvote();
          return;
        }
        
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          localStorage.removeItem('pendingBooking');
          navigate(pendingBooking);
          return;
        }
        
        const pendingMessage = localStorage.getItem('pendingMessage');
        if (pendingMessage) {
          localStorage.removeItem('pendingMessage');
          navigate(pendingMessage);
          return;
        }
        
        const pendingProfileUpdate = localStorage.getItem('pendingProfileUpdate');
        if (pendingProfileUpdate) {
          localStorage.removeItem('pendingProfileUpdate');
          navigate(pendingProfileUpdate);
          return;
        }
        
        const lastPath = localStorage.getItem('lastPath');
        console.log('[AuthProvider] Last path:', lastPath);
        
        if (lastPath) {
          console.log('[AuthProvider] Navigating to last path:', lastPath);
          navigate(lastPath);
          clearLastAction();
          return;
        }
      }
      
      // Default navigation if no specific redirects were triggered
      if (profileComplete && userRole) {
        const dashboardRoutes: Record<UserRole, string> = {
          'family': '/dashboard/family',
          'professional': '/dashboard/professional',
          'community': '/dashboard/community',
          'admin': '/dashboard/admin'
        };
        
        console.log('[AuthProvider] Navigating to dashboard for role:', userRole);
        navigate(dashboardRoutes[userRole]);
        toast.success(`Welcome to your ${userRole} dashboard!`);
      }
    } catch (error) {
      console.error('[AuthProvider] Error during post-login redirection:', error);
    } finally {
      isRedirectingRef.current = false;
    }
  };

  const requireAuth = (action: string, redirectPath?: string) => {
    if (user) return true;

    localStorage.setItem('lastAction', action);
    localStorage.setItem('lastPath', redirectPath || location.pathname + location.search);
    
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

  const clearLastAction = () => {
    localStorage.removeItem('lastAction');
    localStorage.removeItem('lastPath');
    localStorage.removeItem('pendingFeatureId');
    localStorage.removeItem('pendingFeatureUpvote');
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingMessage');
    localStorage.removeItem('pendingProfileUpdate');
  };

  const fetchSessionAndUser = async () => {
    try {
      console.log('[AuthProvider] Fetching session and user...');
      setLoadingWithTimeout(true, 'fetch-session');
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthProvider] Error fetching session:', error);
        setLoadingWithTimeout(false, 'fetch-session-error');
        return;
      }
      
      console.log('[AuthProvider] Session retrieved:', currentSession ? 'Session exists' : 'No session');
      
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        console.log('[AuthProvider] User found in session:', currentSession.user.id);
        const role = await getUserRole();
        console.log('[AuthProvider] User role:', role);
        setUserRole(role);
        
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
  
  useEffect(() => {
    if (user && userRole && isInitializedRef.current) {
      console.log('[AuthProvider] User and role available, handling redirection');
      handlePostLoginRedirection();
    }
  }, [user, userRole, location.pathname]);

  useEffect(() => {
    const clearStaleState = async () => {
      const hadAuthError = localStorage.getItem('authStateError');
      if (hadAuthError) {
        console.log('[AuthProvider] Detected previous auth error, clearing state');
        localStorage.removeItem('authStateError');
        
        try {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setUserRole(null);
          setIsProfileComplete(false);
        } catch (e) {
          console.error('[AuthProvider] Error clearing stale auth state:', e);
        }
      }
    };
    
    clearStaleState();
    
    return () => {
      clearLoadingTimeout();
    };
  }, []);

  useEffect(() => {
    console.log('[AuthProvider] Initial auth check started');
    fetchSessionAndUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, newSession ? 'Has session' : 'No session');
      
      try {
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
            }
          }
          
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] User signed out');
          setLoadingWithTimeout(false, 'auth-state-change-SIGNED_OUT');
          setUserRole(null);
          setIsProfileComplete(false);
          
          localStorage.removeItem('authStateError');
          
          if (isSigningOutRef.current) {
            isSigningOutRef.current = false;
            toast.success('You have been signed out successfully');
            navigate('/');
          }
        } else if (event === 'USER_UPDATED') {
          console.log('[AuthProvider] User updated');
          if (newSession?.user) {
            const role = await getUserRole();
            setUserRole(role);
          }
          
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        } else {
          setLoadingWithTimeout(false, `auth-state-change-complete-${event}`);
        }
      } catch (error) {
        console.error('[AuthProvider] Error handling auth state change:', error);
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
      isSigningOutRef.current = true;
      setLoadingWithTimeout(true, 'sign-out');
      
      // First update our local state - this ensures UI shows signed out immediately
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      
      // Then try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthProvider] Sign out error:', error);
        throw error;
      }
      
      // Navigate and show toast, even if we don't get the auth state change event
      navigate('/');
      toast.success('You have been signed out successfully');
      
      // Set loading to false after signing out
      setLoadingWithTimeout(false, 'sign-out-complete');
      isSigningOutRef.current = false;
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error);
      toast.error('Failed to sign out');
      
      // Still reset everything even if there's an error
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsLoading(false);
      isSigningOutRef.current = false;
      
      localStorage.setItem('authStateError', 'true');
      navigate('/');
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
