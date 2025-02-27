
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getUserRole } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { toast } from 'sonner';

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

  // Function to check if the user's profile is complete
  const checkProfileCompletion = async (userId: string) => {
    try {
      console.log('Checking profile completion for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking profile completion:', error);
        throw error;
      }
      
      console.log('Profile data retrieved:', profile);
      
      // Profile is considered complete if they have at least a full name
      const profileComplete = profile && !!profile.full_name;
      setIsProfileComplete(profileComplete);
      return profileComplete;
    } catch (error) {
      console.error('Error checking profile completion:', error);
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
        console.error('Error handling pending upvote:', error);
        toast.error(error.message || 'Failed to process your vote');
      }
    }
  };

  // Function to check and handle any pending actions after login
  const checkPendingActions = async () => {
    if (!user) return;
    
    console.log('Checking pending actions for user:', user.id);
    console.log('Current user role:', userRole);
    
    // Check if the user has completed their profile
    const profileComplete = await checkProfileCompletion(user.id);
    console.log('Profile complete:', profileComplete);
    
    // List of possible actions stored in localStorage
    const pendingActions = [
      'pendingFeatureUpvote',
      'pendingBooking',
      'pendingMessage',
      'pendingProfileUpdate'
    ];
    
    // Check if any of these actions exist in localStorage
    const hasPendingAction = pendingActions.some(action => localStorage.getItem(action));
    console.log('Has pending action:', hasPendingAction);
    
    // If the user hasn't completed their profile, redirect to the appropriate registration page
    if (!profileComplete && !hasPendingAction) {
      if (userRole) {
        const registrationRoutes: Record<UserRole, string> = {
          'family': '/registration/family',
          'professional': '/registration/professional',
          'community': '/registration/community'
        };
        
        const route = registrationRoutes[userRole];
        console.log('Redirecting to registration page:', route);
        toast.info('Please complete your profile to continue');
        navigate(route);
        return;
      }
    }
    
    // Handle feature upvote if present
    await checkPendingUpvote();
    
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
    console.log('Last path:', lastPath);
    
    if (profileComplete && lastPath) {
      console.log('Navigating to last path:', lastPath);
      navigate(lastPath);
      clearLastAction();
    } else if (profileComplete) {
      // If no last path but profile is complete, redirect to the appropriate dashboard
      if (userRole) {
        console.log('Navigating to dashboard for role:', userRole);
        const dashboardRoutes: Record<UserRole, string> = {
          'family': '/dashboard/family',
          'professional': '/dashboard/professional',
          'community': '/dashboard/community'
        };
        
        navigate(dashboardRoutes[userRole]);
      }
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

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        console.log('Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Session retrieved:', session ? 'Yes' : 'No');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User is signed in, getting role...');
          const role = await getUserRole();
          console.log('User role:', role);
          setUserRole(role);
          
          // Check user profile completion and handle pending actions
          await checkPendingActions();
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Has session' : 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User signed in or updated, getting role...');
        const role = await getUserRole();
        console.log('User role from auth state change:', role);
        setUserRole(role);

        // Check user profile completion and handle pending actions when auth state changes
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          console.log('User signed in or updated, checking pending actions');
          await checkPendingActions();
        }
      } else {
        setUserRole(null);
        setIsProfileComplete(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('You have been signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

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
