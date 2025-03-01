
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Checking Supabase connection...");
        const { error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          console.error("Supabase connection check failed:", error);
          setConnectionStatus('error');
          toast.error("Could not connect to the database. Please try again later.");
        } else {
          console.log("Supabase connection check succeeded");
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error("Error checking Supabase connection:", err);
        setConnectionStatus('error');
        toast.error("Network error. Please check your connection and try again.");
      }
    };
    
    checkConnection();
  }, []);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    if (connectionStatus !== 'connected') {
      toast.error("Cannot authenticate while offline. Please check your connection.");
      return;
    }
    
    try {
      console.log("[AuthPage] Starting login process...");
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthPage] Login error:", error.message);
        
        // Provide more user-friendly error messages
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Please confirm your email address before logging in.");
        } else {
          throw error;
        }
      }

      console.log("[AuthPage] Login successful:", data.session ? "Has session" : "No session");
      // We don't need to navigate here, the AuthProvider will handle it

    } catch (error: any) {
      console.error("[AuthPage] Login error:", error);
      toast.error(error.message || "Failed to log in");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[AuthPage] Login process completed");
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: string) => {
    if (connectionStatus !== 'connected') {
      toast.error("Cannot register while offline. Please check your connection.");
      return;
    }
    
    try {
      console.log("[AuthPage] Starting signup process...");
      setIsLoading(true);

      // Combine first and last name for the full_name metadata
      const fullName = `${firstName} ${lastName}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName, // Send full name in user metadata
            first_name: firstName,
            last_name: lastName
          },
        },
      });

      if (error) {
        console.error("[AuthPage] Signup error:", error.message);
        
        // Provide more user-friendly error messages
        if (error.message.includes("User already registered")) {
          throw new Error("This email is already registered. Try logging in instead.");
        } else {
          throw error;
        }
      }

      console.log("[AuthPage] Signup successful:", data.user ? "User created" : "No user created");
      toast.success("Account created successfully! Please check your email to confirm your account.");
      
      // Check if auto-confirm is enabled
      if (data.session) {
        console.log("[AuthPage] Session created after signup - auto-confirm must be enabled");
        
        // Don't redirect manually, let the AuthProvider handle it
        console.log("[AuthPage] Auth provider will handle redirects");
      } else {
        console.log("[AuthPage] No session after signup - auto-confirm may be disabled");
        toast.info("Please check your email to confirm your account before logging in.");
      }

    } catch (error: any) {
      console.error("[AuthPage] Signup error:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[AuthPage] Signup process completed");
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
          {connectionStatus === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2">
              Connection issues detected. Some features may not work properly.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Takes a Village &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
    </div>
  );
}
