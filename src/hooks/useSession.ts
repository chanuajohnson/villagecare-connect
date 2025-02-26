
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

      console.log('Fetched user role:', data?.role);
      return data?.role;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const handleRoleBasedRedirect = async (userId: string) => {
    try {
      const role = await fetchUserRole(userId);
      setUserRole(role);
      
      if (role) {
        const dashboardPath = `/dashboard/${role.toLowerCase()}`;
        console.log('Redirecting to dashboard:', dashboardPath);
        navigate(dashboardPath);
      } else {
        console.error('No role found for user');
        toast.error('Error determining user role. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleRoleBasedRedirect:', error);
      toast.error('Error determining user role. Please try again.');
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
            await handleRoleBasedRedirect(currentSession.user.id);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setSession(null);
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
        case 'SIGNED_IN':
        case 'SIGNED_UP':
          console.log('Setting session and handling redirect');
          setSession(currentSession);
          if (currentSession?.user) {
            await handleRoleBasedRedirect(currentSession.user.id);
          }
          break;
          
        case 'SIGNED_OUT':
          console.log('Setting session to null due to sign out');
          setSession(null);
          setUserRole(null);
          navigate('/auth');
          break;
          
        case 'USER_UPDATED':
          console.log('Updating session for user update');
          setSession(currentSession);
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
          }
          break;
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
      
      setSession(null);
      setUserRole(null);
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
  };

  return { session, handleSignOut, isLoading, userRole };
};

