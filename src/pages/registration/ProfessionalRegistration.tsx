
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const professionalSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  phone_number: z.string().min(1, { message: "Phone number is required" }),
  professional_type: z.string().min(1, { message: "Professional role is required" }),
  years_of_experience: z.string().min(1, { message: "Years of experience is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  preferred_contact_method: z.string().min(1, { message: "Preferred contact method is required" }),
  care_services: z.array(z.string()).min(1, { message: "At least one care service is required" }),
  specialized_care: z.array(z.string()).min(1, { message: "At least one specialization is required" }),
  availability: z.array(z.string()).min(1, { message: "At least one availability option is required" }),
  emergency_contact: z.string().min(1, { message: "Emergency contact is required" }),
  hourly_rate: z.string().min(1, { message: "Hourly rate is required" }),
  bio: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  additional_professional_notes: z.string().optional(),
  administers_medication: z.boolean().optional(),
  drives_to_work: z.boolean().optional(),
  provides_housekeeping: z.boolean().optional(),
  handles_medical_equipment: z.boolean().optional(),
  commute_mode: z.string().optional(),
  preferred_work_locations: z.string().optional(),
  medical_conditions_experience: z.array(z.string()).optional(),
  other_medical_condition: z.string().optional(),
});

type ProfessionalFormValues = z.infer<typeof professionalSchema>;

const ProfessionalRegistration = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields }
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    mode: "onChange",
    defaultValues: {
      care_services: [],
      specialized_care: [],
      availability: [],
      certifications: [],
      languages: [],
      medical_conditions_experience: []
    }
  });
  
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile data");
          } else if (data) {
            setProfileData(data);
            
            // Populate form fields with existing data
            Object.keys(data).forEach(key => {
              setValue(key as keyof ProfessionalFormValues, data[key]);
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProfileData();
  }, [user, setValue]);
  
  const onSubmit = async (data: ProfessionalFormValues) => {
    if (!user) {
      toast.error("You must be logged in to complete registration");
      return;
    }
    
    setLoading(true);
    
    try {
      // Insert registration data into the database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number,
          location: data.location,
          professional_type: data.professional_type,
          years_of_experience: data.years_of_experience,
          preferred_contact_method: data.preferred_contact_method,
          care_services: data.care_services,
          specialized_care: data.specialized_care,
          availability: data.availability,
          emergency_contact: data.emergency_contact,
          hourly_rate: data.hourly_rate,
          bio: data.bio,
          certifications: data.certifications,
          languages: data.languages,
          additional_professional_notes: data.additional_professional_notes,
          administers_medication: data.administers_medication,
          drives_to_work: data.drives_to_work,
          provides_housekeeping: data.provides_housekeeping,
          handles_medical_equipment: data.handles_medical_equipment,
          commute_mode: data.commute_mode,
          preferred_work_locations: data.preferred_work_locations,
          medical_conditions_experience: data.medical_conditions_experience,
          other_medical_condition: data.other_medical_condition,
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to complete registration");
        throw error;
      }
      
      // Update user metadata with role if needed
      if (!user.user_metadata?.role) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { role: 'professional' }
        });
        
        if (metadataError) {
          console.error("Error updating user metadata:", metadataError);
          toast.error("Failed to update user role");
        }
      }
      
      toast.success("Registration completed successfully");
      navigate('/dashboard/professional');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-5xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Professional Profile Registration</CardTitle>
          <CardDescription>
            Complete your professional profile to help families find the right care match.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="fullName"
                    {...register('full_name')}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phoneNumber"
                    {...register('phone_number')}
                    placeholder="(123) 456-7890"
                    required
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-red-500">{errors.phone_number.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="City, State"
                    required
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact <span className="text-red-500">*</span></Label>
                  <Input
                    id="emergencyContact"
                    {...register('emergency_contact')}
                    placeholder="Name & Phone Number"
                    required
                  />
                  {errors.emergency_contact && (
                    <p className="text-sm text-red-500">{errors.emergency_contact.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="professionalType">Professional Role <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue('professional_type', value)} 
                    defaultValue={watch('professional_type')}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="social_worker">Social Worker</SelectItem>
                      <SelectItem value="home_health_aide">Home Health Aide</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.professional_type && (
                    <p className="text-sm text-red-500">{errors.professional_type.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue('years_of_experience', value)} 
                    defaultValue={watch('years_of_experience')}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                      <SelectItem value="1_to_3">1-3 years</SelectItem>
                      <SelectItem value="3_to_5">3-5 years</SelectItem>
                      <SelectItem value="5_to_10">5-10 years</SelectItem>
                      <SelectItem value="more_than_10">More than 10 years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.years_of_experience && (
                    <p className="text-sm text-red-500">{errors.years_of_experience.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate / Salary Expectations <span className="text-red-500">*</span></Label>
                  <Input
                    id="hourlyRate"
                    {...register('hourly_rate')}
                    placeholder="$25/hr or salary range"
                    required
                  />
                  {errors.hourly_rate && (
                    <p className="text-sm text-red-500">{errors.hourly_rate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactMethod">Preferred Contact Method <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue('preferred_contact_method', value)} 
                    defaultValue={watch('preferred_contact_method')}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.preferred_contact_method && (
                    <p className="text-sm text-red-500">{errors.preferred_contact_method.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Care Services & Specializations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Care Services & Specializations</h3>
              
              <div className="space-y-2">
                <Label>Care Services <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Personal Care", "Mobility Assistance", "Medication Management",
                    "Companionship", "Meal Preparation", "Transportation",
                    "Housekeeping", "Shopping", "Medical Appointments"
                  ].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        value={service}
                        onCheckedChange={(checked) => {
                          const current = watch('care_services') || [];
                          if (checked) {
                            setValue('care_services', [...current, service], { shouldValidate: true });
                          } else {
                            setValue(
                              'care_services',
                              current.filter((val) => val !== service),
                              { shouldValidate: true }
                            );
                          }
                        }}
                      />
                      <label htmlFor={`service-${service}`}>{service}</label>
                    </div>
                  ))}
                </div>
                {errors.care_services && (
                  <p className="text-sm text-red-500">{errors.care_services.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Specializations <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Dementia Care", "Alzheimer's Care", "Parkinson's Care",
                    "Stroke Recovery", "Palliative Care", "Hospice Care",
                    "Diabetes Management", "Cancer Care", "Post-Surgery Recovery"
                  ].map((specialization) => (
                    <div key={specialization} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${specialization}`}
                        value={specialization}
                        onCheckedChange={(checked) => {
                          const current = watch('specialized_care') || [];
                          if (checked) {
                            setValue('specialized_care', [...current, specialization], { shouldValidate: true });
                          } else {
                            setValue(
                              'specialized_care',
                              current.filter((val) => val !== specialization),
                              { shouldValidate: true }
                            );
                          }
                        }}
                      />
                      <label htmlFor={`spec-${specialization}`}>{specialization}</label>
                    </div>
                  ))}
                </div>
                {errors.specialized_care && (
                  <p className="text-sm text-red-500">{errors.specialized_care.message}</p>
                )}
              </div>
            </div>
            
            {/* Availability & Matching Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Availability & Matching Preferences</h3>
              
              <div className="space-y-2">
                <Label>Availability <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Weekday Mornings", "Weekday Afternoons", "Weekday Evenings",
                    "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings",
                    "Overnight", "24-Hour Care", "Live-In", "As Needed"
                  ].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${time}`}
                        value={time}
                        onCheckedChange={(checked) => {
                          const current = watch('availability') || [];
                          if (checked) {
                            setValue('availability', [...current, time], { shouldValidate: true });
                          } else {
                            setValue(
                              'availability',
                              current.filter((val) => val !== time),
                              { shouldValidate: true }
                            );
                          }
                        }}
                      />
                      <label htmlFor={`time-${time}`}>{time}</label>
                    </div>
                  ))}
                </div>
                {errors.availability && (
                  <p className="text-sm text-red-500">{errors.availability.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell families about your experience and approach to care."
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <ScrollArea className="h-40 rounded-md border">
                  <Textarea
                    id="certifications"
                    {...register('certifications')}
                    placeholder="List any certifications you have (e.g., CPR, First Aid, CNA)."
                  />
                </ScrollArea>
                {errors.certifications && (
                  <p className="text-sm text-red-500">{errors.certifications.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="languages">Languages Spoken</Label>
                <ScrollArea className="h-40 rounded-md border">
                  <Textarea
                    id="languages"
                    {...register('languages')}
                    placeholder="List all languages you speak fluently."
                  />
                </ScrollArea>
                {errors.languages && (
                  <p className="text-sm text-red-500">{errors.languages.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Professional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  {...register('additional_professional_notes')}
                  placeholder="Any other relevant information about your professional background."
                />
                {errors.additional_professional_notes && (
                  <p className="text-sm text-red-500">{errors.additional_professional_notes.message}</p>
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferences & Capabilities</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Administers Medication?</Label>
                  <RadioGroup onValueChange={(value) => setValue('administers_medication', value === "true")} className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="medication-yes" />
                      <Label htmlFor="medication-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="medication-no" />
                      <Label htmlFor="medication-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Drives to Work?</Label>
                  <RadioGroup onValueChange={(value) => setValue('drives_to_work', value === "true")} className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="transport-yes" />
                      <Label htmlFor="transport-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="transport-no" />
                      <Label htmlFor="transport-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Provides Housekeeping?</Label>
                  <RadioGroup onValueChange={(value) => setValue('provides_housekeeping', value === "true")} className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="housekeeping-yes" />
                      <Label htmlFor="housekeeping-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="housekeeping-no" />
                      <Label htmlFor="housekeeping-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Handles Medical Equipment?</Label>
                  <RadioGroup onValueChange={(value) => setValue('handles_medical_equipment', value === "true")} className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="equipment-yes" />
                      <Label htmlFor="equipment-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="equipment-no" />
                      <Label htmlFor="equipment-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commuteMode">Preferred Commute Mode</Label>
                  <Input
                    id="commuteMode"
                    {...register('commute_mode')}
                    placeholder="How do you prefer to commute?"
                  />
                  {errors.commute_mode && (
                    <p className="text-sm text-red-500">{errors.commute_mode.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workLocations">Preferred Work Locations</Label>
                  <Input
                    id="workLocations"
                    {...register('preferred_work_locations')}
                    placeholder="Where do you prefer to work?"
                  />
                  {errors.preferred_work_locations && (
                    <p className="text-sm text-red-500">{errors.preferred_work_locations.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Experience with Medical Conditions</h3>
              
              <div className="space-y-2">
                <Label>Experience with Medical Conditions</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Alzheimer's", "Arthritis", "Asthma", "Cancer", "COPD", "Dementia",
                    "Diabetes", "Heart Disease", "Multiple Sclerosis", "Osteoporosis",
                    "Parkinson's", "Stroke"
                  ].map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={`condition-${condition}`}
                        value={condition}
                        onCheckedChange={(checked) => {
                          const current = watch('medical_conditions_experience') || [];
                          if (checked) {
                            setValue('medical_conditions_experience', [...current, condition], { shouldValidate: true });
                          } else {
                            setValue(
                              'medical_conditions_experience',
                              current.filter((val) => val !== condition),
                              { shouldValidate: true }
                            );
                          }
                        }}
                      />
                      <label htmlFor={`condition-${condition}`}>{condition}</label>
                    </div>
                  ))}
                </div>
                {errors.medical_conditions_experience && (
                  <p className="text-sm text-red-500">{errors.medical_conditions_experience.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherCondition">Other Medical Condition</Label>
                <Input
                  id="otherCondition"
                  {...register('other_medical_condition')}
                  placeholder="Specify any other medical conditions you have experience with"
                />
                {errors.other_medical_condition && (
                  <p className="text-sm text-red-500">{errors.other_medical_condition.message}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/dashboard/professional')}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !isValid || Object.keys(errors).length > 0}
            >
              {loading ? "Saving..." : "Complete Registration"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfessionalRegistration;
