
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

  const redirectToDashboard = (role: string) => {
    const dashboardPath = role === 'admin' 
      ? '/dashboard/admin' 
      : `/dashboard/${role.toLowerCase()}`;
    navigate(dashboardPath, { replace: true });
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
        return;
      }
      
      setSession(null);
      setUserRole(null);
      navigate('/auth', { replace: true });
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

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
          setSession(null);
          setUserRole(null);
          if (window.location.pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        setSession(null);
        setUserRole(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_IN':
          setSession(currentSession);
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            if (role) {
              setUserRole(role);
              redirectToDashboard(role);
            }
          }
          break;
          
        case 'SIGNED_OUT':
          setSession(null);
          setUserRole(null);
          navigate('/auth', { replace: true });
          break;
          
        case 'USER_UPDATED':
          setSession(currentSession);
          if (currentSession?.user) {
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
