
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Profile is considered complete if they have at least a full name
      const profileComplete = !!profile.full_name;
      setIsProfileComplete(profileComplete);
      return profileComplete;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

  // Function to handle pending feature upvotes after login
  const checkPendingUpvote = async () => {
    const featureId = sessionStorage.getItem('pendingFeatureUpvote');
    
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
        
        // Remove the pending vote from session storage
        sessionStorage.removeItem('pendingFeatureUpvote');
        
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
    
    // Check if the user has completed their profile
    const profileComplete = await checkProfileCompletion(user.id);
    
    // List of possible actions stored in sessionStorage
    const pendingActions = [
      'pendingFeatureUpvote',
      'pendingBooking',
      'pendingMessage',
      'pendingProfileUpdate'
    ];
    
    // Check if any of these actions exist in sessionStorage
    const hasPendingAction = pendingActions.some(action => sessionStorage.getItem(action));
    
    // If the user hasn't completed their profile, redirect to the appropriate registration page
    if (!profileComplete && !hasPendingAction) {
      if (userRole) {
        const registrationRoutes: Record<UserRole, string> = {
          'family': '/registration/family',
          'professional': '/registration/professional',
          'community': '/registration/community'
        };
        
        const route = registrationRoutes[userRole];
        toast.info('Please complete your profile to continue');
        navigate(route);
        return;
      }
    }
    
    // Handle feature upvote if present (already implemented)
    await checkPendingUpvote();
    
    // Handle pending booking if present
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (pendingBooking) {
      sessionStorage.removeItem('pendingBooking');
      navigate(pendingBooking);
      return;
    }
    
    // Handle pending message if present
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      sessionStorage.removeItem('pendingMessage');
      navigate(pendingMessage);
      return;
    }
    
    // Handle pending profile update if present
    const pendingProfileUpdate = sessionStorage.getItem('pendingProfileUpdate');
    if (pendingProfileUpdate) {
      sessionStorage.removeItem('pendingProfileUpdate');
      navigate(pendingProfileUpdate);
      return;
    }
    
    // If user has completed profile and there are no pending actions
    // Check for last path and redirect there if it exists
    const lastPath = sessionStorage.getItem('lastPath');
    if (profileComplete && lastPath) {
      navigate(lastPath);
      clearLastAction();
    } else if (profileComplete) {
      // If no last path but profile is complete, redirect to the appropriate dashboard
      if (userRole) {
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
    sessionStorage.setItem('lastAction', action);
    sessionStorage.setItem('lastPath', redirectPath || location.pathname + location.search);
    
    // Store specific actions in sessionStorage for post-login handling
    if (action.startsWith('upvote "')) {
      const featureId = sessionStorage.getItem('pendingFeatureId');
      if (featureId) {
        sessionStorage.setItem('pendingFeatureUpvote', featureId);
      }
    } else if (action.startsWith('book care')) {
      sessionStorage.setItem('pendingBooking', redirectPath || location.pathname);
    } else if (action.startsWith('send message')) {
      sessionStorage.setItem('pendingMessage', redirectPath || location.pathname);
    } else if (action.startsWith('update profile')) {
      sessionStorage.setItem('pendingProfileUpdate', redirectPath || location.pathname);
    }
    
    toast.error('Please sign in to ' + action);
    navigate('/auth');
    return false;
  };

  // Function to clear the last action after completion
  const clearLastAction = () => {
    sessionStorage.removeItem('lastAction');
    sessionStorage.removeItem('lastPath');
    sessionStorage.removeItem('pendingFeatureId');
    sessionStorage.removeItem('pendingFeatureUpvote');
    sessionStorage.removeItem('pendingBooking');
    sessionStorage.removeItem('pendingMessage');
    sessionStorage.removeItem('pendingProfileUpdate');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const role = await getUserRole();
          setUserRole(role);
          
          // Check user profile completion and handle pending actions
          await checkPendingActions();
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await getUserRole();
        setUserRole(role);

        // Check user profile completion and handle pending actions when auth state changes
        await checkPendingActions();
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
