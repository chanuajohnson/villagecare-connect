
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Initializing session hook");
    
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got initial session:", currentSession);
        setSession(currentSession);
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed - Event:", event);
      console.log("Auth state changed - Session:", currentSession);
      
      switch (event) {
        case 'SIGNED_OUT':
          console.log('Setting session to null due to sign out');
          setSession(null);
          toast.success('Successfully signed out');
          break;
        case 'SIGNED_IN':
          console.log('Setting session due to sign in');
          setSession(currentSession);
          toast.success('Successfully signed in');
          break;
        default:
          console.log('Updating session state for event:', event);
          setSession(currentSession);
      }
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

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

  return { session, handleSignOut, isLoading };
};
