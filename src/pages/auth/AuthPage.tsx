
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard/family');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleAuth = async (action: 'login' | 'signup') => {
    try {
      setLoading(true);
      console.log(`Attempting to ${action} with email:`, email); // Debug log

      if (action === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        console.log('Signup response:', { data, error }); // Debug log

        if (error) throw error;
        
        if (data.user) {
          toast.success('Registration successful! Please check your email to verify your account.');
        } else {
          toast.error('Something went wrong during registration.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        console.log('Login response:', { data, error }); // Debug log

        if (error) throw error;

        if (data.session) {
          toast.success('Login successful!');
          navigate('/dashboard/family');
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error); // Debug log
      toast.error(error.message);
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
