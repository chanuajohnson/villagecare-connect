
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const handleRoleBasedRedirect = async (userId: string) => {
    const role = await fetchUserRole(userId);
    setUserRole(role);
    
    if (role) {
      const dashboardPath = `/dashboard/${role.toLowerCase()}`;
      console.log('Redirecting to dashboard:', dashboardPath);
      navigate(dashboardPath, { replace: true });
    }
  };

  useEffect(() => {
    console.log("Initializing session hook");
    
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got initial session:", currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          const role = await fetchUserRole(currentSession.user.id);
          setUserRole(role);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed - Event:", event);
      console.log("Auth state changed - Session:", currentSession);
      
      switch (event) {
        case 'SIGNED_OUT':
          console.log('Setting session to null due to sign out');
          setSession(null);
          setUserRole(null);
          toast.success('Successfully signed out');
          navigate('/auth');
          break;
        case 'SIGNED_IN':
        case 'USER_UPDATED':
          console.log('Setting session due to sign in');
          setSession(currentSession);
          if (currentSession?.user) {
            await handleRoleBasedRedirect(currentSession.user.id);
          }
          toast.success('Successfully signed in');
          break;
        default:
          console.log('Updating session state for event:', event);
          setSession(currentSession);
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
          }
      }
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      console.log('Initiating sign out process...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
      console.log('Sign out API call successful');
      // The onAuthStateChange listener will handle the state update and toast
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
  };

  return { session, handleSignOut, isLoading, userRole };
};
