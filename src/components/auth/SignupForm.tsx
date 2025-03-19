
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
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

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
      setSubmissionStatus("submitting");
      console.log('SignupForm submitting with role:', role);
      
      // Store the registration role in localStorage for redirect handling
      localStorage.setItem('registeringAs', role);
      
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
      
      // Show success message
      toast.success("Account created successfully! Please wait while we set up your account...");
      setSubmissionStatus("success");
      
      // After successful registration, explicitly update the profile to ensure the role is set
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Only proceed if we have a valid session
        if (session?.user) {
          console.log('Got session after signup, user ID:', session.user.id);
          
          // Check if profile exists for this user
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error checking for existing profile:', profileError);
          }
          
          // If profile doesn't exist or there was an error, create/update it
          console.log('Existing profile:', profile);
          
          const profileData = {
            id: session.user.id,
            full_name: `${firstName} ${lastName}`.trim(),
            role: role
          };
          
          console.log('Updating profile with data:', profileData);
          
          // Use upsert to create or update the profile
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert(profileData);
          
          if (insertError) {
            console.error('Failed to update profile after signup:', insertError);
            toast.error(`Profile update failed: ${insertError.message}`);
          } else {
            console.log('Profile successfully updated after signup');
          }
          
          // Double-check the profile was updated correctly
          const { data: updatedProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (checkError) {
            console.error('Error verifying profile update:', checkError);
          } else {
            console.log('Profile after update:', updatedProfile);
            
            // If role is still not set correctly, try one more update
            if (updatedProfile && updatedProfile.role !== role) {
              console.warn('Role mismatch! Expected:', role, 'Got:', updatedProfile.role);
              
              // Try one more explicit update
              const { error: roleUpdateError } = await supabase
                .from('profiles')
                .update({ role: role })
                .eq('id', session.user.id);
                
              if (roleUpdateError) {
                console.error('Failed to fix role mismatch:', roleUpdateError);
              } else {
                console.log('Role mismatch corrected');
              }
            }
          }
        } else {
          // No session available, inform user they need to check email
          toast.info("Please check your email to confirm your account before logging in.");
          setSubmissionStatus("success");
        }
      } catch (profileError) {
        console.error('Error updating profile after signup:', profileError);
        toast.error('Account created but profile setup had an error. Please try again later.');
        setSubmissionStatus("error");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      setFormSubmitted(false);
      setSubmissionStatus("error");
    }
  };

  // Redirect to login tab after successful registration
  if (submissionStatus === "success") {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="flex justify-center">
          <div className="bg-green-100 text-green-800 p-4 rounded-md">
            <h3 className="font-medium text-lg">Registration Successful!</h3>
            <p className="mt-2">
              Your account has been created successfully. You can now log in with your credentials.
            </p>
          </div>
        </div>
        <Button 
          className="mt-4" 
          onClick={() => {
            // Reset form state and tell the parent component to switch to login tab
            setFormSubmitted(false);
            setSubmissionStatus("idle");
            const tabsList = document.querySelector('[role="tablist"]');
            const loginTab = tabsList?.querySelector('[value="login"]') as HTMLButtonElement;
            if (loginTab) {
              loginTab.click();
            }
          }}
        >
          Go to Login
        </Button>
      </div>
    );
  }

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
