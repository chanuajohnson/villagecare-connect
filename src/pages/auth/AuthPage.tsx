
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract role from query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    if (role) {
      // If a role is specified, default to signup tab
      setActiveTab('signup');
    }
  }, [location]);

  const signUpUser = async (email: string, password: string, firstName: string, lastName: string, role: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role }
        }
      });

      if (error) {
        toast.error('Sign-up error: ' + error.message);
        return null;
      }

      toast.success('Sign-up successful!');
      if (data.user) navigate('/');
      return data.user;
    } catch (error) {
      console.error('Unexpected error during sign-up:', error);
      toast.error('An unexpected error occurred during sign-up');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Login error: ' + error.message);
        return null;
      }

      toast.success('Login successful!');
      navigate('/');
      return data.user;
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast.error('An unexpected error occurred during login');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onSubmit={loginUser} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm onSubmit={signUpUser} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
