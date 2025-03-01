
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ProfessionalRegistrationFix = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to complete registration");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Verify connection to Supabase before attempting profile updates
      const { error: connectionError } = await supabase.from('profiles').select('count').limit(1);
      if (connectionError) {
        throw new Error(`Connection to database failed: ${connectionError.message}`);
      }
      
      // Update the user's profile with professional role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'professional',
          // Add any form fields here from the form values
        })
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      toast.success("Professional profile created successfully!");
      navigate('/dashboards/professional');
    } catch (error: any) {
      console.error("Error creating professional profile:", error);
      toast.error(`Failed to create professional profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Professional Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields would go here */}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
        </Button>
      </form>
    </div>
  );
};

export default ProfessionalRegistrationFix;
