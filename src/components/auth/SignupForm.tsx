
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/database";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SignupFormProps {
  onSubmit: (email: string, password: string, firstName: string, lastName: string, role: string) => Promise<any>;
  isLoading: boolean;
}

export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("family");
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Function to create or update user profile with exponential backoff retry
  const ensureUserProfile = async (userId: string, userData: any, currentRetry = 0): Promise<boolean> => {
    try {
      console.log(`Attempt ${currentRetry + 1}/${MAX_RETRIES} to ensure profile for user ${userId}`);
      
      // Use upsert to create or update the profile
      const { error } = await supabase
        .from('profiles')
        .upsert(userData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`Profile upsert error (attempt ${currentRetry + 1}):`, error);
        
        // Check if we should retry
        if (currentRetry < MAX_RETRIES - 1) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = Math.pow(2, currentRetry) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return ensureUserProfile(userId, userData, currentRetry + 1);
        } else {
          throw error;
        }
      }
      
      console.log(`Profile successfully created/updated for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed all attempts to create/update profile:', error);
      return false;
    }
  };

  // Function to verify profile creation was successful
  const verifyProfileCreation = async (userId: string, expectedRole: UserRole): Promise<{ success: boolean, profile: any }> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error verifying profile:', error);
        return { success: false, profile: null };
      }
      
      if (!profile) {
        console.error('No profile found during verification');
        return { success: false, profile: null };
      }
      
      // Check if role matches expected role
      const roleMatchesExpected = profile.role === expectedRole;
      console.log('Profile verification:', { 
        found: true, 
        roleMatches: roleMatchesExpected,
        expected: expectedRole,
        actual: profile.role
      });
      
      return { 
        success: true, 
        profile 
      };
    } catch (error) {
      console.error('Exception during profile verification:', error);
      return { success: false, profile: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName || !role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setFormSubmitted(true);
      console.log('SignupForm submitting with role:', role);
      
      // Store the registration role in localStorage for redirect handling
      localStorage.setItem('registeringAs', role);
      localStorage.setItem('registrationRole', role);
      
      // Set up user metadata with role and name for profile creation
      const metadata = {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        role: role
      };
      
      console.log('Setting user metadata:', metadata);
      
      // Pass the registration to the parent component
      await onSubmit(email, password, firstName, lastName, role);
      
      // After successful registration, explicitly ensure the profile exists with correct role
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Only proceed if we have a valid session
        if (session?.user) {
          console.log('Got session after signup, user ID:', session.user.id);
          
          // Prepare profile data
          const profileData = {
            id: session.user.id,
            full_name: `${firstName} ${lastName}`.trim(),
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Creating/updating profile with data:', profileData);
          
          // First attempt: Create/update profile
          const profileCreated = await ensureUserProfile(session.user.id, profileData);
          
          if (!profileCreated) {
            toast.error("There was an issue creating your profile. Please try again.");
            console.error("Failed to create/update profile after multiple attempts");
            return;
          }
          
          // Verify profile was created with correct role
          const { success, profile } = await verifyProfileCreation(session.user.id, role as UserRole);
          
          if (success && profile) {
            // If role is not set correctly, try one more explicit update for just the role
            if (profile.role !== role) {
              console.warn('Role mismatch detected! Expected:', role, 'Got:', profile.role);
              
              // Try an explicit role update
              const { error: roleUpdateError } = await supabase
                .from('profiles')
                .update({ role: role })
                .eq('id', session.user.id);
                
              if (roleUpdateError) {
                console.error('Failed to fix role mismatch:', roleUpdateError);
                // Even if this fails, we'll continue since the profile exists
              } else {
                console.log('Role mismatch corrected successfully');
              }
            }
          } else {
            console.error('Profile verification failed after creation');
            toast.error('Your account was created, but there may be an issue with your profile. Please contact support.');
          }
        } else {
          console.error('No session available after signup');
          toast.error('Account created but session not established. Please try logging in.');
        }
      } catch (profileError: any) {
        console.error('Error handling profile after signup:', profileError);
        toast.error(`Account created but profile setup had an error: ${profileError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      setFormSubmitted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading || formSubmitted}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading || formSubmitted}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || formSubmitted}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || formSubmitted}
            autoComplete="new-password"
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading || formSubmitted}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={role} 
          onValueChange={(value) => {
            console.log('Role selected:', value);
            setRole(value as UserRole);
            // Store the selected role immediately in localStorage
            localStorage.setItem('registeringAs', value);
            localStorage.setItem('registrationRole', value);
          }}
          disabled={isLoading || formSubmitted}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family">Family Member</SelectItem>
            <SelectItem value="professional">Healthcare Professional</SelectItem>
            <SelectItem value="community">Community Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={isLoading || formSubmitted}
      >
        {isLoading || formSubmitted ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
