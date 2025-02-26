
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useSession = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    console.log("Initializing session hook");
    
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got session:", currentSession);
        setSession(currentSession);
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log("Auth state changed:", _event, currentSession);
      
      if (_event === 'SIGNED_OUT') {
        console.log('User signed out, clearing session');
        setSession(null);
        toast.success('Successfully signed out');
      } else if (_event === 'SIGNED_IN') {
        setSession(currentSession);
        toast.success('Successfully signed in');
      } else {
        setSession(currentSession);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.log('No active session found');
        setSession(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
  };

  return { session, handleSignOut };
};

