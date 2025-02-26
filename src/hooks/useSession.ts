
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
    let mounted = true;
    
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got initial session:", currentSession);
        
        if (mounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed - Event:", event);
      console.log("Auth state changed - Session:", currentSession);
      
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_OUT':
          console.log('Setting session to null due to sign out');
          setSession(null);
          setUserRole(null);
          // Ensure navigation happens after state is cleared
          setTimeout(() => {
            if (mounted) {
              navigate('/auth', { replace: true });
              toast.success('Successfully signed out');
            }
          }, 0);
          break;
        case 'SIGNED_IN':
          console.log('Setting session due to sign in');
          setSession(currentSession);
          if (currentSession?.user) {
            await handleRoleBasedRedirect(currentSession.user.id);
            if (mounted) {
              toast.success('Successfully signed in');
            }
          }
          break;
        case 'USER_UPDATED':
          console.log('Updating session for user update');
          if (mounted) {
            setSession(currentSession);
            if (currentSession?.user) {
              const role = await fetchUserRole(currentSession.user.id);
              setUserRole(role);
            }
          }
          break;
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      console.log('Initiating sign out process...');
      setIsLoading(true);

      // Clear local state first
      setSession(null);
      setUserRole(null);

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
      
      // The onAuthStateChange listener will handle navigation and toast
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    } finally {
      setIsLoading(false);
    }
  };

  return { session, handleSignOut, isLoading, userRole };
};
