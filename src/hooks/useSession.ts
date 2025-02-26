
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AuthChangeEvent } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      console.log('Fetched user role:', data?.role);
      return data?.role;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Initiating sign out process...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
      
      // Clear session and role states
      setSession(null);
      setUserRole(null);
      
      // Force navigation to auth page
      console.log('Redirecting to auth page...');
      navigate('/auth', { replace: true });
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeSession = async () => {
      try {
        console.log("Checking initial session...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check result:", currentSession);
        
        if (!mounted) return;

        if (!currentSession?.user) {
          console.log("No session found, redirecting to auth...");
          setSession(null);
          setIsLoading(false);
          navigate('/auth', { replace: true });
          return;
        }

        // We have a session
        setSession(currentSession);
        const role = await fetchUserRole(currentSession.user.id);
        console.log("Fetched role for initial session:", role);
        setUserRole(role);
        
        if (role) {
          const dashboardPath = role === 'admin' 
            ? '/dashboard/admin' 
            : `/dashboard/${role.toLowerCase()}`;
          console.log("Redirecting to dashboard:", dashboardPath);
          navigate(dashboardPath, { replace: true });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error in initializeSession:", error);
        if (mounted) {
          setSession(null);
          setIsLoading(false);
          navigate('/auth', { replace: true });
        }
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      if (!mounted) return;

      console.log("Auth state changed:", event);
      console.log("New session state:", currentSession);

      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          setSession(currentSession);
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
            if (role) {
              const dashboardPath = role === 'admin' 
                ? '/dashboard/admin' 
                : `/dashboard/${role.toLowerCase()}`;
              navigate(dashboardPath, { replace: true });
            }
          }
          break;
          
        case 'SIGNED_OUT':
          console.log('User signed out');
          setSession(null);
          setUserRole(null);
          navigate('/auth', { replace: true });
          break;
          
        case 'USER_UPDATED':
          console.log('User updated');
          setSession(currentSession);
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
          }
          break;
      }
    });

    return () => {
      console.log("Cleaning up session hook");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { session, handleSignOut, isLoading, userRole };
};
