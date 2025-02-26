
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for userId:', userId);
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

  const redirectToDashboard = (role: string) => {
    console.log('Redirecting to dashboard for role:', role);
    const dashboardPath = role === 'admin' 
      ? '/dashboard/admin' 
      : `/dashboard/${role.toLowerCase()}`;
    navigate(dashboardPath, { replace: true });
  };

  const clearSession = () => {
    console.log('Clearing session state');
    setSession(null);
    setUserRole(null);
    setIsLoading(false);
    navigate('/auth', { replace: true });
  };

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
        return;
      }
      
      console.log('Sign out successful');
      toast.success('Successfully signed out');
      clearSession();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        console.log('Initializing session...');
        setIsLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        console.log('Current session:', currentSession);

        if (currentSession?.user) {
          setSession(currentSession);
          const role = await fetchUserRole(currentSession.user.id);
          if (role) {
            setUserRole(role);
            if (window.location.pathname === '/auth') {
              redirectToDashboard(role);
            }
          }
        } else {
          console.log('No active session found');
          if (window.location.pathname !== '/auth') {
            clearSession();
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        clearSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
      console.log('Current session:', currentSession);

      switch (event) {
        case 'SIGNED_IN':
          if (currentSession?.user) {
            setSession(currentSession);
            const role = await fetchUserRole(currentSession.user.id);
            if (role) {
              setUserRole(role);
              redirectToDashboard(role);
            }
          }
          break;
          
        case 'SIGNED_OUT':
          console.log('Handling SIGNED_OUT event');
          clearSession();
          break;
          
        case 'USER_UPDATED':
          if (currentSession?.user) {
            setSession(currentSession);
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
          }
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { session, handleSignOut, isLoading, userRole };
};
