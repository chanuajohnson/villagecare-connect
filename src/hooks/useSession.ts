
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
      
      // Navigate to auth page
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
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
            if (role) {
              const dashboardPath = role === 'admin' 
                ? '/dashboard/admin' 
                : `/dashboard/${role.toLowerCase()}`;
              navigate(dashboardPath);
            }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
      console.log("Auth state changed - Event:", event);
      console.log("Auth state changed - Session:", currentSession);
      
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_IN':
          console.log('Setting session and handling redirect');
          setSession(currentSession);
          if (currentSession?.user) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
            if (role) {
              const dashboardPath = role === 'admin' 
                ? '/dashboard/admin' 
                : `/dashboard/${role.toLowerCase()}`;
              navigate(dashboardPath);
            }
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

  return { session, handleSignOut, isLoading, userRole };
};
