
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"request" | "reset">("reset");
  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const validateResetToken = async () => {
      try {
        setValidatingToken(true);
        console.log("[ResetPasswordPage] Validating reset token...");
        
        // Check for various types of reset tokens in the URL
        const type = searchParams.get("type");
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresIn = searchParams.get("expires_in");
        const tokenType = searchParams.get("token_type");
        const code = searchParams.get("code");
        
        console.log("[ResetPasswordPage] URL params:", { 
          type, 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code
        });
        
        // Handle recovery flow with code parameter
        if (type === "recovery" && code) {
          console.log("[ResetPasswordPage] Processing recovery with code");
          
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("[ResetPasswordPage] Token exchange error:", error);
              setError("Invalid or expired password reset link. Please request a new one.");
              setMode("request");
              setValidatingToken(false);
              return;
            }
            
            if (data?.user) {
              console.log("[ResetPasswordPage] Valid reset token for user:", data.user.email);
              setEmail(data.user.email || null);
              setMode("reset");
              setError(null);
              setTokenValidated(true);
              
              toast.info("Please set a new password you'll remember.", { duration: 6000 });
            } else {
              console.error("[ResetPasswordPage] No user data returned from token exchange");
              setError("Invalid password reset link. Please request a new one.");
              setMode("request");
            }
          } catch (exchangeError) {
            console.error("[ResetPasswordPage] Error exchanging code:", exchangeError);
            setError("Error processing your reset link. Please request a new one.");
            setMode("request");
          }
        } 
        // Handle hash fragment tokens (#access_token=...)
        else if (location.hash && (location.hash.includes("access_token") || location.hash.includes("type=recovery"))) {
          console.log("[ResetPasswordPage] Processing hash fragment token");
          
          try {
            // The session will be automatically set by Supabase client
            const { data: { user }, error: sessionError } = await supabase.auth.getUser();
            
            if (sessionError || !user) {
              console.error("[ResetPasswordPage] Session error:", sessionError);
              setError("Invalid or expired password reset link. Please request a new one.");
              setMode("request");
            } else {
              console.log("[ResetPasswordPage] Valid token, user found:", user.email);
              setEmail(user.email || null);
              setError(null);
              setTokenValidated(true);
              
              toast.info("Please set a new password you'll remember.", { duration: 6000 });
            }
          } catch (sessionError) {
            console.error("[ResetPasswordPage] Error getting user from session:", sessionError);
            setError("Error processing your reset link. Please request a new one.");
            setMode("request");
          }
        }
        // If we have direct access_token and refresh_token in query params
        else if (accessToken && refreshToken) {
          console.log("[ResetPasswordPage] Processing with direct tokens");
          
          try {
            // Set the session manually with the provided tokens
            const { data: { user }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (setSessionError || !user) {
              console.error("[ResetPasswordPage] Set session error:", setSessionError);
              setError("Invalid or expired password reset link. Please request a new one.");
              setMode("request");
            } else {
              console.log("[ResetPasswordPage] Valid direct tokens, user found:", user.email);
              setEmail(user.email || null);
              setError(null);
              setTokenValidated(true);
              
              toast.info("Please set a new password you'll remember.", { duration: 6000 });
            }
          } catch (tokenError) {
            console.error("[ResetPasswordPage] Error setting session from tokens:", tokenError);
            setError("Error processing your reset link. Please request a new one.");
            setMode("request");
          }
        }
        // If no valid reset parameters found
        else {
          console.log("[ResetPasswordPage] No valid reset parameters found in URL");
          setError("No valid reset token found. Please request a password reset link.");
          setMode("request");
        }
      } catch (error: any) {
        console.error("[ResetPasswordPage] Error during token validation:", error);
        setError("An error occurred while validating your reset token. Please try again.");
        setMode("request");
      } finally {
        setValidatingToken(false);
      }
    };

    validateResetToken();
  }, [location, searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("[ResetPasswordPage] Updating password...");
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("[ResetPasswordPage] Error resetting password:", error);
        throw error;
      }
      
      toast.success("Password has been reset successfully");
      setResetComplete(true);
    } catch (error: any) {
      console.error("[ResetPasswordPage] Error:", error);
      toast.error(error.message || "Failed to reset password");
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestReset = async (email: string) => {
    try {
      setIsLoading(true);
      console.log("[ResetPasswordPage] Requesting password reset for:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      console.log("[ResetPasswordPage] Password reset email sent successfully");
      return true;
    } catch (error: any) {
      console.error("[ResetPasswordPage] Error requesting reset:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  if (validatingToken) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Validating your password reset link...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (resetComplete) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Password Reset Complete</CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
              <p className="font-medium">Success!</p>
              <p className="text-sm mt-2">
                Your password has been updated. You're now logged in with your new password.
              </p>
            </div>
            <div className="mt-6">
              <Button 
                onClick={() => navigate("/")} 
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Takes a Village &copy; {new Date().getFullYear()}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            {mode === "reset" ? "Please enter your new password below" : "Request a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "request" ? (
            <ResetPasswordForm 
              onSubmit={handleRequestReset}
              onBack={() => navigate("/auth")}
              email={email || ""}
              isLoading={isLoading}
            />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              {error}
              <div className="mt-4">
                <Button 
                  onClick={() => setMode("request")} 
                  variant="secondary"
                  className="mr-2"
                >
                  Request New Link
                </Button>
                <Button 
                  onClick={() => navigate("/auth")} 
                  variant="outline"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          ) : tokenValidated ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {email && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
                  <p className="font-medium">You're setting a new password for {email}</p>
                  <p className="text-sm mt-2">
                    Please enter a new password that you'll remember for future logins.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : (
            // This condition ensures we never show an empty state
            // If token is not validated and there's no error, redirect to request mode
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-4">
              <p className="font-medium">Something went wrong with your reset link</p>
              <p className="text-sm mt-2">
                We couldn't properly validate your password reset link. Please request a new one.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => setMode("request")} 
                  variant="secondary"
                >
                  Request New Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Takes a Village &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
    </div>
  );
}
