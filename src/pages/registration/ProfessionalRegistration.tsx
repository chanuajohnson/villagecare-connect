import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile, updateUserProfile } from "@/utils/profile-utils";

// Define the form schema with Zod
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  professionalType: z.string({
    required_error: 'Please select your professional type',
  }),
  yearsOfExperience: z.string().min(1, 'Please enter years of experience'),
  specialties: z.string().optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  licenseNumber: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfessionalRegistration() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      professionalType: '',
      yearsOfExperience: '',
      specialties: '',
      bio: '',
      licenseNumber: '',
      acceptTerms: false,
    },
  });

  // Fetch existing profile data if available
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          // Split full name into first and last name
          const nameParts = (data.full_name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Update form with existing data
          form.reset({
            firstName,
            lastName,
            professionalType: data.professional_type || '',
            yearsOfExperience: data.years_of_experience?.toString() || '',
            specialties: data.specialties || '',
            bio: data.bio || '',
            licenseNumber: data.license_number || '',
            acceptTerms: false, // Always require re-acceptance
          });
        }
      } catch (error) {
        console.error('Error in fetchProfileData:', error);
      }
    };

    fetchProfileData();
  }, [user, form]);

  // Redirect if user is not logged in or not a professional
  useEffect(() => {
    if (user && userRole && userRole !== 'professional') {
      toast.error('This registration is for healthcare professionals only');
      navigate(`/registration/${userRole}`);
    }
  }, [user, userRole, navigate]);

  const handleFormSubmit = async (formData: FormValues) => {
    if (!user) {
      console.error('No user found. Please log in again.');
      toast.error('No user found. Please log in again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting professional profile data:', formData);
      
      // First ensure the profile exists
      const profileExists = await ensureUserProfile(
        user.id, 
        `${formData.firstName} ${formData.lastName}`.trim(),
        'professional'
      );
      
      if (!profileExists) {
        throw new Error('Failed to ensure profile exists');
      }
      
      // Create a properly structured data object
      const profileData = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: 'professional',
        professional_type: formData.professionalType,
        years_of_experience: formData.yearsOfExperience,
        specialties: formData.specialties,
        bio: formData.bio,
        license_number: formData.licenseNumber,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Formatted profile data for update:', profileData);
      
      // Update the profile
      const { success, error } = await updateUserProfile(user.id, profileData);
      
      if (!success) {
        throw new Error(error?.message || 'Failed to update professional profile');
      }
      
      console.log('Professional profile created/updated successfully');
      toast.success('Your professional profile has been created!');
      
      // Navigate to the professional dashboard
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error('Error in professional profile submission:', error);
      toast.error(`Error creating professional profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Professional Registration</h1>
        <p className="text-muted-foreground mt-2">
          Complete your profile to connect with families in need
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="professionalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your profession" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="social_worker">Social Worker</SelectItem>
                      <SelectItem value="counselor">Counselor</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Years of professional experience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="specialties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialties</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your areas of specialization (e.g., Pediatrics, Mental Health)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of your specialties
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell families about your background, approach, and experience"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be visible on your public profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License/Certification Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your professional license or certification number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This helps verify your credentials
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormDescription>
                    I agree to the terms of service and privacy policy. I confirm
                    that all information provided is accurate and I have the
                    qualifications stated.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Complete Registration'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
