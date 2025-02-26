
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (action: 'login' | 'signup') => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to ${action} with email:`, email);

      if (action === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });

        if (error) {
          console.error('Signup error:', error);
          toast.error(error.message);
          return;
        }
        
        if (data?.user) {
          toast.success('Registration successful! Please check your email to verify your account.');
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

        if (error) {
          console.error('Login error:', error);
          toast.error(error.message);
          return;
        }

        if (data?.session) {
          console.log('Login successful, fetching user role');
          toast.success('Login successful!');
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error('Error loading user profile');
            return;
          }

          if (profileData?.role) {
            const returnTo = localStorage.getItem('returnTo');
            localStorage.removeItem('returnTo');
            
            const dashboardPath = profileData.role === 'admin' 
              ? '/dashboard/admin'
              : `/dashboard/${profileData.role.toLowerCase()}`;
            
            console.log('Redirecting to:', returnTo || dashboardPath);
            navigate(returnTo || dashboardPath, { replace: true });
          } else {
            console.error('No role found for user');
            toast.error('Error loading user profile');
          }
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
                <LogIn className="w-4 h-4 mr-2" />
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
