
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define form schema with Zod
const professionalFormSchema = z.object({
  // Personal Information
  full_name: z.string().min(1, 'Name is required'),
  professional_type: z.string().min(1, 'Professional role is required'),
  other_professional_type: z.string().optional(),
  years_of_experience: z.string().min(1, 'Years of experience is required'),
  
  // Contact Information
  location: z.string().min(1, 'Location is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  
  // Professional Qualifications
  license_number: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  other_certification: z.string().optional(),
  medical_conditions_experience: z.array(z.string()).optional(),
  other_medical_condition: z.string().optional(),
  care_services: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  
  // Work Preferences
  work_type: z.string().min(1, 'Work type is required'),
  availability: z.array(z.string()).optional(),
  commute_mode: z.string().optional(),
  preferred_work_locations: z.string().optional(),
  
  // Rate and Payment
  expected_rate: z.string().min(1, 'Expected rate is required'),
  hourly_rate: z.string().optional(),
  payment_methods: z.array(z.string()).optional(),
  
  // Additional Information
  bio: z.string().min(1, 'Bio is required'),
  why_choose_caregiving: z.string().optional(),
  additional_professional_notes: z.string().optional(),
  
  // Safety and Verification
  background_check: z.boolean().optional(),
  has_liability_insurance: z.boolean().optional(),
  legally_authorized: z.boolean().refine(val => val === true, {
    message: 'You must be legally authorized to work in the country',
  }),
  emergency_contact: z.string().optional(),
  
  // Service Capabilities
  administers_medication: z.boolean().optional(),
  provides_housekeeping: z.boolean().optional(),
  provides_transportation: z.boolean().optional(),
  handles_medical_equipment: z.boolean().optional(),
  
  // Preferences
  list_in_directory: z.boolean().optional(),
  enable_job_alerts: z.boolean().optional(),
  job_notification_method: z.string().optional(),
  job_matching_criteria: z.array(z.string()).optional(),
  custom_availability_alerts: z.string().optional(),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

const ProfessionalRegistration = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtherProfessionalType, setShowOtherProfessionalType] = useState(false);
  const [showOtherCertification, setShowOtherCertification] = useState(false);
  const [showOtherMedicalCondition, setShowOtherMedicalCondition] = useState(false);
  
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
      full_name: user?.userData?.full_name || '',
      professional_type: '',
      other_professional_type: '',
      years_of_experience: '',
      location: '',
      phone_number: user?.userData?.phone_number || '',
      license_number: '',
      certifications: [],
      other_certification: '',
      medical_conditions_experience: [],
      other_medical_condition: '',
      care_services: [],
      languages: [],
      work_type: '',
      availability: [],
      commute_mode: '',
      preferred_work_locations: '',
      expected_rate: '',
      hourly_rate: '',
      payment_methods: [],
      bio: '',
      why_choose_caregiving: '',
      additional_professional_notes: '',
      background_check: false,
      has_liability_insurance: false,
      legally_authorized: false,
      emergency_contact: '',
      administers_medication: false,
      provides_housekeeping: false,
      provides_transportation: false,
      handles_medical_equipment: false,
      list_in_directory: true,
      enable_job_alerts: true,
      job_notification_method: 'email',
      job_matching_criteria: [],
      custom_availability_alerts: '',
    }
  });
  
  const professionalType = watch('professional_type');
  const certificationsValue = watch('certifications');
  const medicalConditionsValue = watch('medical_conditions_experience');
  
  useEffect(() => {
    setShowOtherProfessionalType(professionalType === 'other');
  }, [professionalType]);
  
  useEffect(() => {
    setShowOtherCertification(
      Array.isArray(certificationsValue) && 
      certificationsValue.includes('other')
    );
  }, [certificationsValue]);
  
  useEffect(() => {
    setShowOtherMedicalCondition(
      Array.isArray(medicalConditionsValue) && 
      medicalConditionsValue.includes('other')
    );
  }, [medicalConditionsValue]);
  
  const onSubmit = async (data: ProfessionalFormValues) => {
    console.log('Form data:', data);
    
    if (!user?.id) {
      toast.error('User not found. Please sign in again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user profile with professional data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone_number: data.phone_number,
          professional_type: data.professional_type,
          other_professional_type: data.other_professional_type,
          years_of_experience: data.years_of_experience,
          location: data.location,
          license_number: data.license_number,
          certifications: data.certifications,
          other_certification: data.other_certification,
          medical_conditions_experience: data.medical_conditions_experience,
          other_medical_condition: data.other_medical_condition,
          care_services: data.care_services,
          languages: data.languages,
          work_type: data.work_type,
          availability: data.availability,
          commute_mode: data.commute_mode,
          preferred_work_locations: data.preferred_work_locations,
          expected_rate: data.expected_rate,
          hourly_rate: data.hourly_rate,
          payment_methods: data.payment_methods,
          bio: data.bio,
          why_choose_caregiving: data.why_choose_caregiving,
          additional_professional_notes: data.additional_professional_notes,
          background_check: data.background_check,
          has_liability_insurance: data.has_liability_insurance,
          legally_authorized: data.legally_authorized,
          emergency_contact: data.emergency_contact,
          administers_medication: data.administers_medication,
          provides_housekeeping: data.provides_housekeeping,
          provides_transportation: data.provides_transportation,
          handles_medical_equipment: data.handles_medical_equipment,
          list_in_directory: data.list_in_directory,
          enable_job_alerts: data.enable_job_alerts,
          job_notification_method: data.job_notification_method,
          job_matching_criteria: data.job_matching_criteria,
          custom_availability_alerts: data.custom_availability_alerts,
          profile_completed: true,
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        toast.error(`Registration failed: ${error.message}`);
        return;
      }
      
      // Refresh user data
      if (updateUser) {
        await updateUser();
      }
      
      toast.success('Professional profile created successfully!');
      navigate('/dashboards/professional');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Professional Registration</h1>
        <p className="text-muted-foreground mt-2">
          Complete your profile to start connecting with families in need of care services
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Provide your basic information so families can get to know you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Your full name"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="professional_type">Professional Role</Label>
                <Controller
                  control={control}
                  name="professional_type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse">Registered Nurse (RN)</SelectItem>
                        <SelectItem value="lpn">Licensed Practical Nurse (LPN)</SelectItem>
                        <SelectItem value="cna">Certified Nursing Assistant (CNA)</SelectItem>
                        <SelectItem value="caregiver">Professional Caregiver</SelectItem>
                        <SelectItem value="therapist">Therapist</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.professional_type && (
                  <p className="text-sm text-red-500">{errors.professional_type.message}</p>
                )}
              </div>
              
              {showOtherProfessionalType && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="other_professional_type">Specify Other Professional Role</Label>
                  <Input
                    id="other_professional_type"
                    placeholder="Describe your professional role"
                    {...register('other_professional_type')}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Controller
                  control={control}
                  name="years_of_experience"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Less than 1 year</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.years_of_experience && (
                  <p className="text-sm text-red-500">{errors.years_of_experience.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How clients can reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location (City, State)</Label>
                <Input
                  id="location"
                  placeholder="e.g. Austin, TX"
                  {...register('location')}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="Your phone number"
                  {...register('phone_number')}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">{errors.phone_number.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Professional Qualifications</CardTitle>
            <CardDescription>
              Your credentials and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="license_number">License/Certification Number (Optional)</Label>
              <Input
                id="license_number"
                placeholder="Enter your license number if applicable"
                {...register('license_number')}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Certifications & Training</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="certifications"
                  render={({ field }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cpr" 
                          checked={field.value?.includes('cpr')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'cpr'] 
                              : values.filter(v => v !== 'cpr');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="cpr">CPR Certified</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="first_aid" 
                          checked={field.value?.includes('first_aid')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'first_aid'] 
                              : values.filter(v => v !== 'first_aid');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="first_aid">First Aid</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dementia_care" 
                          checked={field.value?.includes('dementia_care')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'dementia_care'] 
                              : values.filter(v => v !== 'dementia_care');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="dementia_care">Dementia Care</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="medication_management" 
                          checked={field.value?.includes('medication_management')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'medication_management'] 
                              : values.filter(v => v !== 'medication_management');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="medication_management">Medication Management</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other_cert" 
                          checked={field.value?.includes('other')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'other'] 
                              : values.filter(v => v !== 'other');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="other_cert">Other</Label>
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
            
            {showOtherCertification && (
              <div className="space-y-2">
                <Label htmlFor="other_certification">Specify Other Certification</Label>
                <Input
                  id="other_certification"
                  placeholder="Enter your other certification"
                  {...register('other_certification')}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Medical Conditions Experience</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="medical_conditions_experience"
                  render={({ field }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="alzheimers" 
                          checked={field.value?.includes('alzheimers')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'alzheimers'] 
                              : values.filter(v => v !== 'alzheimers');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="alzheimers">Alzheimer's/Dementia</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parkinsons" 
                          checked={field.value?.includes('parkinsons')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'parkinsons'] 
                              : values.filter(v => v !== 'parkinsons');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="parkinsons">Parkinson's</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="stroke" 
                          checked={field.value?.includes('stroke')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'stroke'] 
                              : values.filter(v => v !== 'stroke');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="stroke">Stroke Recovery</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="diabetes" 
                          checked={field.value?.includes('diabetes')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'diabetes'] 
                              : values.filter(v => v !== 'diabetes');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="diabetes">Diabetes</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cancer" 
                          checked={field.value?.includes('cancer')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'cancer'] 
                              : values.filter(v => v !== 'cancer');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="cancer">Cancer Care</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other_medical" 
                          checked={field.value?.includes('other')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'other'] 
                              : values.filter(v => v !== 'other');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="other_medical">Other</Label>
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
            
            {showOtherMedicalCondition && (
              <div className="space-y-2">
                <Label htmlFor="other_medical_condition">Specify Other Medical Conditions</Label>
                <Input
                  id="other_medical_condition"
                  placeholder="Enter other medical conditions you have experience with"
                  {...register('other_medical_condition')}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="languages"
                  render={({ field }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="english" 
                          checked={field.value?.includes('english')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'english'] 
                              : values.filter(v => v !== 'english');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="english">English</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="spanish" 
                          checked={field.value?.includes('spanish')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'spanish'] 
                              : values.filter(v => v !== 'spanish');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="spanish">Spanish</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="french" 
                          checked={field.value?.includes('french')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'french'] 
                              : values.filter(v => v !== 'french');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="french">French</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mandarin" 
                          checked={field.value?.includes('mandarin')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'mandarin'] 
                              : values.filter(v => v !== 'mandarin');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="mandarin">Mandarin</Label>
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Work Preferences</CardTitle>
            <CardDescription>
              Details about your availability and work style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="work_type">Work Type</Label>
              <Controller
                control={control}
                name="work_type"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full_time" id="full_time" />
                      <Label htmlFor="full_time">Full-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="part_time" id="part_time" />
                      <Label htmlFor="part_time">Part-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="as_needed" id="as_needed" />
                      <Label htmlFor="as_needed">As Needed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live_in" id="live_in" />
                      <Label htmlFor="live_in">Live-in</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.work_type && (
                <p className="text-sm text-red-500">{errors.work_type.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Availability</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="availability"
                  render={({ field }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="weekdays" 
                          checked={field.value?.includes('weekdays')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'weekdays'] 
                              : values.filter(v => v !== 'weekdays');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="weekdays">Weekdays</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="weekends" 
                          checked={field.value?.includes('weekends')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'weekends'] 
                              : values.filter(v => v !== 'weekends');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="weekends">Weekends</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="evenings" 
                          checked={field.value?.includes('evenings')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'evenings'] 
                              : values.filter(v => v !== 'evenings');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="evenings">Evenings</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="overnight" 
                          checked={field.value?.includes('overnight')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'overnight'] 
                              : values.filter(v => v !== 'overnight');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="overnight">Overnight</Label>
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_work_locations">Preferred Work Locations</Label>
              <Input
                id="preferred_work_locations"
                placeholder="e.g. North Austin, Cedar Park, etc."
                {...register('preferred_work_locations')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commute_mode">Transportation</Label>
              <Controller
                control={control}
                name="commute_mode"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How you commute" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own_car">Own Car</SelectItem>
                      <SelectItem value="public_transport">Public Transportation</SelectItem>
                      <SelectItem value="carpool">Carpool/Rideshare</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="walk">Walk</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rate and Payment</CardTitle>
            <CardDescription>
              Information about your compensation expectations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expected_rate">Expected Pay Rate</Label>
                <Controller
                  control={control}
                  name="expected_rate"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select expected rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-20">$15-20/hour</SelectItem>
                        <SelectItem value="20-25">$20-25/hour</SelectItem>
                        <SelectItem value="25-30">$25-30/hour</SelectItem>
                        <SelectItem value="30-40">$30-40/hour</SelectItem>
                        <SelectItem value="40+">$40+/hour</SelectItem>
                        <SelectItem value="negotiable">Negotiable</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.expected_rate && (
                  <p className="text-sm text-red-500">{errors.expected_rate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Specific Hourly Rate (Optional)</Label>
                <Input
                  id="hourly_rate"
                  placeholder="e.g. $22/hour"
                  {...register('hourly_rate')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Methods</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="payment_methods"
                  render={({ field }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="direct_deposit" 
                          checked={field.value?.includes('direct_deposit')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'direct_deposit'] 
                              : values.filter(v => v !== 'direct_deposit');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="direct_deposit">Direct Deposit</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="check" 
                          checked={field.value?.includes('check')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'check'] 
                              : values.filter(v => v !== 'check');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="check">Check</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cash" 
                          checked={field.value?.includes('cash')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'cash'] 
                              : values.filter(v => v !== 'cash');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="cash">Cash</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="digital_payment" 
                          checked={field.value?.includes('digital_payment')}
                          onCheckedChange={(checked) => {
                            const values = field.value || [];
                            const newValues = checked 
                              ? [...values, 'digital_payment'] 
                              : values.filter(v => v !== 'digital_payment');
                            field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor="digital_payment">Digital Payment Apps</Label>
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Tell families more about yourself
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Share your professional background and approach to caregiving"
                rows={4}
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="why_choose_caregiving">Why You Chose Caregiving (Optional)</Label>
              <Textarea
                id="why_choose_caregiving"
                placeholder="What inspired you to become a caregiver?"
                rows={3}
                {...register('why_choose_caregiving')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_professional_notes">Additional Professional Notes (Optional)</Label>
              <Textarea
                id="additional_professional_notes"
                placeholder="Any other information you'd like to share"
                rows={3}
                {...register('additional_professional_notes')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Safety and Verification</CardTitle>
            <CardDescription>
              Important security and legal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="background_check"
                  checked={watch('background_check')}
                  onCheckedChange={(checked) => {
                    setValue('background_check', checked === true);
                  }}
                />
                <Label htmlFor="background_check">
                  I have completed a background check in the past year
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_liability_insurance"
                  checked={watch('has_liability_insurance')}
                  onCheckedChange={(checked) => {
                    setValue('has_liability_insurance', checked === true);
                  }}
                />
                <Label htmlFor="has_liability_insurance">
                  I have professional liability insurance
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legally_authorized"
                  checked={watch('legally_authorized')}
                  onCheckedChange={(checked) => {
                    setValue('legally_authorized', checked === true);
                  }}
                />
                <Label htmlFor="legally_authorized">
                  I am legally authorized to work in this country
                </Label>
              </div>
              {errors.legally_authorized && (
                <p className="text-sm text-red-500">{errors.legally_authorized.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact Information (Optional)</Label>
              <Input
                id="emergency_contact"
                placeholder="Name and phone number"
                {...register('emergency_contact')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Capabilities</CardTitle>
            <CardDescription>
              Additional services you can provide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="administers_medication"
                    checked={watch('administers_medication')}
                    onCheckedChange={(checked) => {
                      setValue('administers_medication', checked === true);
                    }}
                  />
                  <Label htmlFor="administers_medication">
                    Can administer medication
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="provides_housekeeping"
                    checked={watch('provides_housekeeping')}
                    onCheckedChange={(checked) => {
                      setValue('provides_housekeeping', checked === true);
                    }}
                  />
                  <Label htmlFor="provides_housekeeping">
                    Provides light housekeeping
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="provides_transportation"
                    checked={watch('provides_transportation')}
                    onCheckedChange={(checked) => {
                      setValue('provides_transportation', checked === true);
                    }}
                  />
                  <Label htmlFor="provides_transportation">
                    Provides transportation
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="handles_medical_equipment"
                    checked={watch('handles_medical_equipment')}
                    onCheckedChange={(checked) => {
                      setValue('handles_medical_equipment', checked === true);
                    }}
                  />
                  <Label htmlFor="handles_medical_equipment">
                    Can operate medical equipment
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacy and Notifications</CardTitle>
            <CardDescription>
              Control how you appear in searches and receive updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="list_in_directory"
                  checked={watch('list_in_directory')}
                  onCheckedChange={(checked) => {
                    setValue('list_in_directory', checked === true);
                  }}
                />
                <Label htmlFor="list_in_directory">
                  List me in the professional directory
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, families can find your profile in our professional directory
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_job_alerts"
                  checked={watch('enable_job_alerts')}
                  onCheckedChange={(checked) => {
                    setValue('enable_job_alerts', checked === true);
                  }}
                />
                <Label htmlFor="enable_job_alerts">
                  Send me job notifications
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Receive alerts when new jobs matching your skills become available
              </p>
            </div>
            
            {watch('enable_job_alerts') && (
              <div className="space-y-2">
                <Label htmlFor="job_notification_method">Notification Method</Label>
                <Controller
                  control={control}
                  name="job_notification_method"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How to notify you" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS/Text</SelectItem>
                        <SelectItem value="both">Both Email and SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalRegistration;
