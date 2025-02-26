
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return path from the URL search params or default to family dashboard
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/dashboard/family';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('User is already logged in, redirecting to:', returnTo);
        navigate(returnTo);
      }
    };
    
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session?.user) {
        navigate(returnTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, returnTo]);

  const handleAuth = async (action: 'login' | 'signup') => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to ${action} with email:`, email);

      if (action === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?returnTo=${encodeURIComponent(returnTo)}`
          }
        });

        console.log('Signup response:', { data, error });

        if (error) {
          toast.error(error.message);
          return;
        }
        
        if (data?.user) {
          toast.success('Registration successful! Please check your email to verify your account.');
          // Clear the form
          setEmail('');
          setPassword('');
        } else {
          toast.error('Unable to create account. Please try again.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        console.log('Login response:', { data, error });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data?.session) {
          toast.success('Login successful!');
          // Navigation will be handled by onAuthStateChange
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Takes a Village</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button 
                type="submit" 
                onClick={() => handleAuth('login')}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Sign In'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleAuth('signup')}
                disabled={loading}
              >
                Create Account
              </Button>
              <UpvoteFeatureButton 
                featureTitle="Authentication Enhancements"
                className="mt-4"
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

