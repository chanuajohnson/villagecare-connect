
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Function to require authentication for specific actions
  const requireAuth = (action: string, redirectPath?: string) => {
    if (user) return true;

    // Store the last action and current path
    sessionStorage.setItem('lastAction', action);
    sessionStorage.setItem('lastPath', redirectPath || location.pathname + location.search);
    
    // If the action is an upvote, store the feature ID
    if (action.startsWith('upvote "')) {
      const featureId = sessionStorage.getItem('pendingFeatureId');
      if (featureId) {
        sessionStorage.setItem('pendingFeatureUpvote', featureId);
      }
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
          
          // If user just logged in, check for pending upvotes
          await checkPendingUpvote();
          
          // If user just logged in and there was a last action, redirect back
          const lastPath = sessionStorage.getItem('lastPath');
          if (location.pathname === '/auth' && lastPath && !sessionStorage.getItem('pendingFeatureUpvote')) {
            navigate(lastPath);
            clearLastAction();
          }
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

        // Check for pending upvotes when auth state changes
        await checkPendingUpvote();

        // Check for last action on auth state change
        const lastPath = sessionStorage.getItem('lastPath');
        if (lastPath && !sessionStorage.getItem('pendingFeatureUpvote')) {
          navigate(lastPath);
          clearLastAction();
        }
      } else {
        setUserRole(null);
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
      checkPendingUpvote
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
