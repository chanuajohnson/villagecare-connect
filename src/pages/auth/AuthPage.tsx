
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signUpUser = async (email: string, password: string, firstName: string, lastName: string, role: string) => {
    setIsLoading(true);
    console.log('Starting signup process for:', email, 'with role:', role);
    
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role }
        }
      });

      if (error) {
        console.error('Sign-up error:', error);
        toast.error('Sign-up error: ' + error.message);
        setIsLoading(false);
        return null;
      }

      if (!user) {
        toast.error('No user data returned after signup');
        setIsLoading(false);
        return null;
      }

      console.log('Sign-up successful, user data:', user);
      toast.success('Sign-up successful! Redirecting you to complete your profile...');
      
      // After signup, we'll be redirected to the registration page by the auth provider
      // based on the user's role, so we don't need to navigate here
      
      setIsLoading(false);
      return user;

    } catch (error) {
      console.error('Unexpected error during sign-up:', error);
      toast.error('An unexpected error occurred during sign-up');
      setIsLoading(false);
      return null;
    }
  };

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Starting login process for:', email);
    
    try {
      // Immediately clear any existing auth session to force a clean login
      // This helps ensure auth state is properly updated
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.warn('Warning when clearing previous session:', signOutError);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Login error: ' + error.message);
        setIsLoading(false);
        return null;
      }

      console.log('Login successful, user data:', data);
      toast.success('Login successful! Redirecting you...');
      
      // After login, the auth provider will redirect based on profile completion
      // so we don't need to navigate here
      
      // Important: Set a short timeout before changing isLoading
      // This gives time for the auth state to propagate
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return data.user;
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast.error('An unexpected error occurred during login');
      setIsLoading(false);
      return null;
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
            <Tabs defaultValue="login" className="w-full">
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
