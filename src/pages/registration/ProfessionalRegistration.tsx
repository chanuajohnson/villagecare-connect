import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define form schema with Zod
const professionalFormSchema = z.object({
  // Personal Information
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  professional_type: z.string().min(1, 'Professional role is required'),
  other_professional_type: z.string().optional(),
  years_of_experience: z.string().min(1, 'Years of experience is required'),
  
  // Contact Information
  location: z.string().min(1, 'Location is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Service Offerings
  primary_services: z.array(z.string()).optional(),
  specialized_services: z.array(z.string()).optional(),
  
  // Availability
  availability: z.string().optional(),
  preferred_hours: z.string().optional(),
  
  // Compliance & Legal
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  licensed: z.boolean().optional(),
  background_check: z.boolean().optional(),
  
  // Additional Information
  bio: z.string().optional(),
  additional_notes: z.string().optional(),
  certifications: z.string().optional(),
  emergency_contact: z.string().optional(),
  preferred_contact_method: z.string().optional(),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageURL, setProfileImageURL] = useState<string | null>(null);
  
  const { 
    control, 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      email: user?.email || '',
      first_name: '',
      last_name: '',
      professional_type: '',
      years_of_experience: '',
      location: '',
      phone: '',
      primary_services: [],
      specialized_services: [],
      availability: '',
      preferred_hours: '',
      terms_accepted: false,
      licensed: false,
      background_check: false,
      bio: '',
      additional_notes: '',
      certifications: '',
      emergency_contact: '',
      preferred_contact_method: '',
    }
  });
  
  const selectedProfessionalType = watch('professional_type');
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageURL(URL.createObjectURL(file));
    }
  };
  
  const onSubmit = async (data: ProfessionalFormValues) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error("You must be logged in to register");
        return;
      }
  
      let profileImagePath = null;
  
      // Upload profile image if it exists
      if (profileImage) {
        const filename = `${uuidv4()}-${profileImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filename, profileImage);
  
        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
  
        profileImagePath = `${filename}`;
      }
      
      // Combine first and last name for full_name
      const full_name = `${data.first_name} ${data.last_name}`.trim();
  
      // Insert professional profile into database
      const { error: insertError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: user.id,
          profile_image: profileImagePath,
          full_name: full_name,
          first_name: data.first_name,
          last_name: data.last_name,
          professional_type: data.professional_type,
          other_professional_type: data.other_professional_type,
          years_of_experience: data.years_of_experience,
          location: data.location,
          email: data.email,
          phone: data.phone,
          primary_services: data.primary_services,
          specialized_services: data.specialized_services,
          availability: data.availability,
          preferred_hours: data.preferred_hours,
          licensed: data.licensed,
          background_check: data.background_check,
          bio: data.bio,
          additional_notes: data.additional_notes,
          certifications: data.certifications,
          emergency_contact: data.emergency_contact,
          preferred_contact_method: data.preferred_contact_method,
          terms_accepted: data.terms_accepted,
          registration_completed: true,
        });
  
      if (insertError) {
        throw new Error(`Error creating professional profile: ${insertError.message}`);
      }
  
      // Update user profile with registration info using supabase directly
      // since updateUser is not available in the current AuthContextType
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          registration_completed: true,
          user_type: 'professional',
        })
        .eq('id', user.id);
  
      if (updateError) {
        throw new Error(`Error updating user profile: ${updateError.message}`);
      }
  
      toast.success("Professional registration completed successfully!");
      navigate('/dashboard/professional');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Professional Registration</h1>
      <p className="text-center text-muted-foreground mb-8">
        Complete your profile to connect with families and showcase your professional services.
      </p>
  
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-2 overflow-hidden">
                {profileImageURL ? (
                  <img src={profileImageURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl text-slate-300">👤</div>
                )}
              </div>
              <label 
                htmlFor="profile-image" 
                className="text-sm text-blue-600 cursor-pointer hover:underline"
              >
                Upload Profile Picture
              </label>
              <input 
                id="profile-image" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleProfileImageChange}
              />
            </div>
            <h2 className="text-xl font-semibold">Personal & Contact Information</h2>
            <p className="text-sm text-muted-foreground mb-4">Tell us about yourself so we can connect you with the right clients.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="first-name" className="mb-1">First Name <span className="text-red-500">*</span></Label>
                <Input
                  id="first-name"
                  placeholder="Enter your first name"
                  {...register('first_name')}
                  className={errors.first_name ? "border-red-500" : ""}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="last-name" className="mb-1">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  id="last-name"
                  placeholder="Enter your last name"
                  {...register('last_name')}
                  className={errors.last_name ? "border-red-500" : ""}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>
  
              <div>
                <Label htmlFor="email" className="mb-1">Email Address</Label>
                <Input
                  id="email"
                  readOnly
                  {...register('email')}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">Email address from your registration</p>
              </div>
              
              <div>
                <Label htmlFor="phone" className="mb-1">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  placeholder="Phone Number"
                  {...register('phone')}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="location" className="mb-1">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  placeholder="City/State"
                  {...register('location')}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="professional-type" className="mb-1">Professional Role <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="professional_type"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger className={errors.professional_type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="therapist">Therapist</SelectItem>
                        <SelectItem value="social_worker">Social Worker</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.professional_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.professional_type.message}</p>
                )}
              </div>
              
              {selectedProfessionalType === 'other' && (
                <div>
                  <Label htmlFor="other-professional-type" className="mb-1">Specify Role <span className="text-red-500">*</span></Label>
                  <Input
                    id="other-professional-type"
                    placeholder="Specify your professional role"
                    {...register('other_professional_type')}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="years-of-experience" className="mb-1">Years of Experience <span className="text-red-500">*</span></Label>
                <Input
                  id="years-of-experience"
                  placeholder="e.g., 5"
                  {...register('years_of_experience')}
                  className={errors.years_of_experience ? "border-red-500" : ""}
                />
                {errors.years_of_experience && (
                  <p className="text-red-500 text-sm mt-1">{errors.years_of_experience.message}</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="bio" className="mb-1">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell potential clients about your background, skills, and approach to caregiving..."
                {...register('bio')}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="mb-6">
              <Label htmlFor="certifications" className="mb-1">Licenses & Certifications</Label>
              <Textarea
                id="certifications"
                placeholder="List any relevant certifications, licenses, or training you have received..."
                {...register('certifications')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">Care Services Offered</h2>
            <p className="text-sm text-muted-foreground mb-4">What types of care services do you provide?</p>
            
            <div className="mb-6">
              <Label className="mb-3 block">Primary Care Services (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="personal-care"
                        checked={field.value?.includes('personal_care')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'personal_care']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'personal_care'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="personal-care" className="leading-tight cursor-pointer">
                    👤 Personal Care (Bathing, Grooming, Dressing)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="companionship"
                        checked={field.value?.includes('companionship')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'companionship']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'companionship'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="companionship" className="leading-tight cursor-pointer">
                    🤝 Companionship & Social Support
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="meal-prep"
                        checked={field.value?.includes('meal_prep')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'meal_prep']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'meal_prep'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="meal-prep" className="leading-tight cursor-pointer">
                    🍲 Meal Preparation & Nutrition
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="medication"
                        checked={field.value?.includes('medication')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'medication']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'medication'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="medication" className="leading-tight cursor-pointer">
                    💊 Medication Reminders
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="mobility"
                        checked={field.value?.includes('mobility')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'mobility']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'mobility'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="mobility" className="leading-tight cursor-pointer">
                    🚶 Mobility Assistance & Fall Prevention
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="housekeeping"
                        checked={field.value?.includes('housekeeping')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'housekeeping']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'housekeeping'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="housekeeping" className="leading-tight cursor-pointer">
                    🧹 Light Housekeeping
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="primary_services"
                    render={({ field }) => (
                      <Checkbox
                        id="transportation"
                        checked={field.value?.includes('transportation')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('primary_services', [...currentValues, 'transportation']);
                          } else {
                            setValue('primary_services', currentValues.filter(value => value !== 'transportation'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="transportation" className="leading-tight cursor-pointer">
                    🚗 Transportation & Errands
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <Label className="mb-3 block">Specialized Services (Select if applicable)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="specialized_services"
                    render={({ field }) => (
                      <Checkbox
                        id="dementia"
                        checked={field.value?.includes('dementia')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('specialized_services', [...currentValues, 'dementia']);
                          } else {
                            setValue('specialized_services', currentValues.filter(value => value !== 'dementia'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="dementia" className="leading-tight cursor-pointer">
                    🧠 Dementia/Alzheimer's Care
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="specialized_services"
                    render={({ field }) => (
                      <Checkbox
                        id="post-surgery"
                        checked={field.value?.includes('post_surgery')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('specialized_services', [...currentValues, 'post_surgery']);
                          } else {
                            setValue('specialized_services', currentValues.filter(value => value !== 'post_surgery'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="post-surgery" className="leading-tight cursor-pointer">
                    🏥 Post-Hospital/Surgery Recovery
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="specialized_services"
                    render={({ field }) => (
                      <Checkbox
                        id="hospice"
                        checked={field.value?.includes('hospice')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('specialized_services', [...currentValues, 'hospice']);
                          } else {
                            setValue('specialized_services', currentValues.filter(value => value !== 'hospice'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="hospice" className="leading-tight cursor-pointer">
                    ❤️ Hospice/End-of-Life Support
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="specialized_services"
                    render={({ field }) => (
                      <Checkbox
                        id="special-needs"
                        checked={field.value?.includes('special_needs')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('specialized_services', [...currentValues, 'special_needs']);
                          } else {
                            setValue('specialized_services', currentValues.filter(value => value !== 'special_needs'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="special-needs" className="leading-tight cursor-pointer">
                    👦 Special Needs Care
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="specialized_services"
                    render={({ field }) => (
                      <Checkbox
                        id="respite"
                        checked={field.value?.includes('respite')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('specialized_services', [...currentValues, 'respite']);
                          } else {
                            setValue('specialized_services', currentValues.filter(value => value !== 'respite'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="respite" className="leading-tight cursor-pointer">
                    🛌 Respite Care for Family Caregivers
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">Availability & Preferences</h2>
            <p className="text-sm text-muted-foreground mb-4">Let clients know when and how you prefer to work.</p>
            
            <div className="mb-6">
              <Label htmlFor="preferred-hours" className="mb-1">Availability & Preferred Hours</Label>
              <Input
                id="preferred-hours"
                placeholder="e.g., Mon-Fri, 8 AM - 5 PM"
                {...register('preferred_hours')}
              />
            </div>
            
            <div className="mb-6">
              <Label htmlFor="emergency-contact" className="mb-1">Emergency Contact Information</Label>
              <Input
                id="emergency-contact"
                placeholder="Name, relationship, phone number"
                {...register('emergency_contact')}
              />
            </div>
            
            <div>
              <Label htmlFor="preferred-contact-method" className="mb-1">Preferred Contact Method</Label>
              <Controller
                control={control}
                name="preferred_contact_method"
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Contact Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="app">In-App Messaging</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">Compliance & Additional Information</h2>
            <p className="text-sm text-muted-foreground mb-4">Required verification and any additional notes.</p>
            
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-start space-x-2">
                <Controller
                  control={control}
                  name="licensed"
                  render={({ field }) => (
                    <Checkbox
                      id="licensed"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="licensed" className="leading-tight cursor-pointer">
                  I confirm I have all required licenses and certifications for my profession
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Controller
                  control={control}
                  name="background_check"
                  render={({ field }) => (
                    <Checkbox
                      id="background-check"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="background-check" className="leading-tight cursor-pointer">
                  I am willing to undergo a background check if required by clients
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Controller
                  control={control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={errors.terms_accepted ? "border-red-500" : ""}
                    />
                  )}
                />
                <div>
                  <Label htmlFor="terms" className="leading-tight cursor-pointer">
                    I agree to the <span className="text-primary underline">Terms of Service</span> and <span className="text-primary underline">Privacy Policy</span>
                  </Label>
                  {errors.terms_accepted && (
                    <p className="text-red-500 text-sm mt-1">{errors.terms_accepted.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="additional-notes" className="mb-1">Additional Notes</Label>
              <Textarea
                id="additional-notes"
                placeholder="Any other information you would like to share..."
                {...register('additional_notes')}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalRegistration;
