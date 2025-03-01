
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
  
  // Professional Details
  license_number: z.string().min(1, 'License number is required'),
  certifications: z.array(z.string()).optional(),
  other_certification: z.string().optional(),
  
  // Care Services
  care_services: z.array(z.string()).min(1, 'Select at least one care service'),
  other_care_service: z.string().optional(),
  
  // Languages
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  other_language: z.string().optional(),
  
  // Availability & Working Preferences
  work_type: z.string().min(1, 'Work type is required'),
  availability: z.array(z.string()).min(1, 'Select at least one availability option'),
  expected_rate: z.string().min(1, 'Expected rate is required'),
  payment_methods: z.array(z.string()).min(1, 'Select at least one payment method'),
  preferred_work_locations: z.string().min(1, 'Preferred work locations are required'),
  commute_mode: z.string().min(1, 'Commute mode is required'),
  
  // Background & Verification
  background_check: z.boolean(),
  legally_authorized: z.boolean(),
  
  // Profile & Bio
  bio: z.string().min(10, 'Bio should be at least 10 characters'),
  why_choose_caregiving: z.string().min(10, 'This field should be at least 10 characters'),
  
  // Visibility & Notifications
  list_in_directory: z.boolean().optional(),
  enable_job_alerts: z.boolean().optional(),
  job_notification_method: z.string().optional(),
  job_matching_criteria: z.array(z.string()).optional(),
  custom_availability_alerts: z.string().optional(),
  
  // Medical Information
  medical_conditions: z.array(z.string()).optional(),
  other_medical_condition: z.string().optional(),
  
  // Terms & Conditions
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export default function ProfessionalRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form setup
  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      full_name: '',
      professional_type: '',
      other_professional_type: '',
      years_of_experience: '',
      location: '',
      phone_number: '',
      license_number: '',
      certifications: [],
      other_certification: '',
      care_services: [],
      other_care_service: '',
      languages: [],
      other_language: '',
      work_type: '',
      availability: [],
      expected_rate: '',
      payment_methods: [],
      preferred_work_locations: '',
      commute_mode: '',
      background_check: false,
      legally_authorized: false,
      bio: '',
      why_choose_caregiving: '',
      list_in_directory: false,
      enable_job_alerts: false,
      job_notification_method: '',
      job_matching_criteria: [],
      custom_availability_alerts: '',
      medical_conditions: [],
      other_medical_condition: '',
      terms_accepted: false,
    },
  });
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast.error('You need to be logged in to register as a professional');
      navigate('/auth');
    }
  }, [user, navigate]);
  
  const onSubmit = async (data: ProfessionalFormValues) => {
    if (!user) {
      toast.error('You need to be logged in to register as a professional');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: 'professional',
          professional_type: data.professional_type,
          other_professional_type: data.other_professional_type,
          license_number: data.license_number,
          certifications: data.certifications,
          other_certification: data.other_certification,
          care_services: data.care_services,
          other_care_service: data.other_care_service,
          languages: data.languages,
          other_language: data.other_language,
          years_of_experience: data.years_of_experience,
          work_type: data.work_type,
          availability: data.availability,
          background_check: data.background_check,
          legally_authorized: data.legally_authorized,
          expected_rate: data.expected_rate,
          payment_methods: data.payment_methods,
          bio: data.bio,
          why_choose_caregiving: data.why_choose_caregiving,
          preferred_work_locations: data.preferred_work_locations,
          commute_mode: data.commute_mode,
          list_in_directory: data.list_in_directory,
          enable_job_alerts: data.enable_job_alerts,
          job_notification_method: data.job_notification_method,
          job_matching_criteria: data.job_matching_criteria,
          custom_availability_alerts: data.custom_availability_alerts,
          medical_conditions: data.medical_conditions,
          other_medical_condition: data.other_medical_condition,
          phone_number: data.phone_number,
          location: data.location,
        })
        .eq('id', user.id);
      
      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      
      // Upload certification document if provided
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `certification-${uuidv4()}.${fileExt}`;
        const filePath = `certification/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, selectedFile);
          
        if (uploadError) {
          console.error('Error uploading certification document:', uploadError);
          toast.error('Error uploading certification document, but profile was updated');
        } else {
          // Update the certification_proof_url in the profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ certification_proof_url: filePath })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating certification URL:', updateError);
          }
        }
      }
      
      toast.success('Professional profile created successfully!');
      navigate('/professional/dashboard');
    } catch (error) {
      console.error('Error during professional registration:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const professionalTypes = [
    'Registered Nurse (RN)',
    'Licensed Practical Nurse (LPN)',
    'Certified Nursing Assistant (CNA)',
    'Home Health Aide (HHA)',
    'Physical Therapist',
    'Occupational Therapist',
    'Speech Therapist',
    'Respiratory Therapist',
    'Social Worker',
    'Counselor',
    'Psychologist',
    'Physician',
    'Physician Assistant',
    'Dietitian/Nutritionist',
    'Personal Care Aide',
    'Companion Care',
    'Other'
  ];
  
  const certificationOptions = [
    'Basic Life Support (BLS)',
    'Advanced Cardiac Life Support (ACLS)',
    'Pediatric Advanced Life Support (PALS)',
    'Certified Nursing Assistant (CNA)',
    'Home Health Aide (HHA)',
    'Certified Medication Aide (CMA)',
    'First Aid',
    'CPR',
    'Dementia Care',
    'Hospice and Palliative Care',
    'Other'
  ];
  
  const careServiceOptions = [
    'Personal Care',
    'Medication Management',
    'Mobility Assistance',
    'Meal Preparation',
    'Companionship',
    'Light Housekeeping',
    'Transportation',
    'Recovery Care',
    'Specialized Care',
    'Respite Care',
    'Other'
  ];
  
  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'Chinese',
    'Tagalog',
    'Vietnamese',
    'Korean',
    'German',
    'Arabic',
    'Russian',
    'Italian',
    'Portuguese',
    'Hindi',
    'Japanese',
    'Other'
  ];
  
  const availabilityOptions = [
    'Weekday Mornings',
    'Weekday Afternoons',
    'Weekday Evenings',
    'Weekday Overnight',
    'Weekend Mornings',
    'Weekend Afternoons',
    'Weekend Evenings',
    'Weekend Overnight',
    '24-Hour Care',
    'Live-In Care'
  ];
  
  const paymentMethodOptions = [
    'Insurance',
    'Medicare',
    'Medicaid',
    'Private Pay',
    'Long-term Care Insurance',
    'Veterans Benefits',
    'Credit Card',
    'Check',
    'Electronic Transfer'
  ];
  
  const medicalConditionOptions = [
    'None',
    'Allergies',
    'Asthma',
    'Diabetes',
    'Heart Condition',
    'High Blood Pressure',
    'Mobility Limitations',
    'Other'
  ];
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="border-none shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Professional Registration</CardTitle>
          <CardDescription className="text-center">
            Create your professional profile to offer caregiving services
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    {...form.register('full_name')}
                  />
                  {form.formState.errors.full_name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="professional_type">Professional Role</Label>
                  <Controller
                    control={form.control}
                    name="professional_type"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your professional role" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionalTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.professional_type && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.professional_type.message}
                    </p>
                  )}
                </div>
                
                {form.watch('professional_type') === 'Other' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="other_professional_type">Please specify</Label>
                    <Input
                      id="other_professional_type"
                      placeholder="Enter your professional role"
                      {...form.register('other_professional_type')}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Controller
                    control={form.control}
                    name="years_of_experience"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select years of experience" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map((years) => (
                            <SelectItem key={years} value={years}>
                              {years}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.years_of_experience && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.years_of_experience.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    {...form.register('location')}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    placeholder="(XXX) XXX-XXXX"
                    {...form.register('phone_number')}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Professional Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Details</h3>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License/Registration Number</Label>
                  <Input
                    id="license_number"
                    placeholder="Enter your license number"
                    {...form.register('license_number')}
                  />
                  {form.formState.errors.license_number && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.license_number.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Upload Certification Document (Optional)</Label>
                  <Input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload certification in PDF, JPG or PNG format
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Certifications (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <Controller
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <>
                          {certificationOptions.map((certification) => (
                            <div key={certification} className="flex items-center space-x-2">
                              <Checkbox
                                id={`certification-${certification}`}
                                checked={field.value?.includes(certification)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), certification]
                                    : (field.value || []).filter((value) => value !== certification);
                                  field.onChange(updatedValue);
                                }}
                              />
                              <Label htmlFor={`certification-${certification}`} className="text-sm">
                                {certification}
                              </Label>
                            </div>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>
                
                {form.watch('certifications')?.includes('Other') && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="other_certification">Other Certification</Label>
                    <Input
                      id="other_certification"
                      placeholder="Please specify other certification"
                      {...form.register('other_certification')}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Care Services Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Care Services</h3>
              <Separator />
              
              <div className="space-y-2">
                <Label>Services You Provide (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  <Controller
                    control={form.control}
                    name="care_services"
                    render={({ field }) => (
                      <>
                        {careServiceOptions.map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={`service-${service}`}
                              checked={field.value?.includes(service)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), service]
                                  : (field.value || []).filter((value) => value !== service);
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor={`service-${service}`} className="text-sm">
                              {service}
                            </Label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
                {form.formState.errors.care_services && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.care_services.message}
                  </p>
                )}
              </div>
              
              {form.watch('care_services')?.includes('Other') && (
                <div className="space-y-2">
                  <Label htmlFor="other_care_service">Other Care Service</Label>
                  <Input
                    id="other_care_service"
                    placeholder="Please specify other care service"
                    {...form.register('other_care_service')}
                  />
                </div>
              )}
            </div>
            
            {/* Languages Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Languages</h3>
              <Separator />
              
              <div className="space-y-2">
                <Label>Languages Spoken (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  <Controller
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <>
                        {languageOptions.map((language) => (
                          <div key={language} className="flex items-center space-x-2">
                            <Checkbox
                              id={`language-${language}`}
                              checked={field.value?.includes(language)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), language]
                                  : (field.value || []).filter((value) => value !== language);
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor={`language-${language}`} className="text-sm">
                              {language}
                            </Label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
                {form.formState.errors.languages && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.languages.message}
                  </p>
                )}
              </div>
              
              {form.watch('languages')?.includes('Other') && (
                <div className="space-y-2">
                  <Label htmlFor="other_language">Other Language</Label>
                  <Input
                    id="other_language"
                    placeholder="Please specify other language"
                    {...form.register('other_language')}
                  />
                </div>
              )}
            </div>
            
            {/* Availability & Working Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Availability & Working Preferences</h3>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="work_type">Preferred Work Type</Label>
                  <Controller
                    control={form.control}
                    name="work_type"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Full-time" id="work-full-time" />
                          <Label htmlFor="work-full-time">Full-time</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Part-time" id="work-part-time" />
                          <Label htmlFor="work-part-time">Part-time</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="As-needed" id="work-as-needed" />
                          <Label htmlFor="work-as-needed">As-needed</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {form.formState.errors.work_type && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.work_type.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Availability (Select all that apply)</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Controller
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <>
                          {availabilityOptions.map((availability) => (
                            <div key={availability} className="flex items-center space-x-2">
                              <Checkbox
                                id={`availability-${availability}`}
                                checked={field.value?.includes(availability)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), availability]
                                    : (field.value || []).filter((value) => value !== availability);
                                  field.onChange(updatedValue);
                                }}
                              />
                              <Label htmlFor={`availability-${availability}`} className="text-sm">
                                {availability}
                              </Label>
                            </div>
                          ))}
                        </>
                      )}
                    />
                  </div>
                  {form.formState.errors.availability && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.availability.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expected_rate">Expected Hourly Rate (USD)</Label>
                  <Input
                    id="expected_rate"
                    placeholder="Enter your expected rate"
                    {...form.register('expected_rate')}
                  />
                  {form.formState.errors.expected_rate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.expected_rate.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Methods Accepted (Select all that apply)</Label>
                  <div className="grid grid-cols-1 gap-1">
                    <Controller
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => (
                        <>
                          {paymentMethodOptions.map((method) => (
                            <div key={method} className="flex items-center space-x-2">
                              <Checkbox
                                id={`payment-${method}`}
                                checked={field.value?.includes(method)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), method]
                                    : (field.value || []).filter((value) => value !== method);
                                  field.onChange(updatedValue);
                                }}
                              />
                              <Label htmlFor={`payment-${method}`} className="text-sm">
                                {method}
                              </Label>
                            </div>
                          ))}
                        </>
                      )}
                    />
                  </div>
                  {form.formState.errors.payment_methods && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.payment_methods.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferred_work_locations">Preferred Work Locations</Label>
                  <Input
                    id="preferred_work_locations"
                    placeholder="Cities, neighborhoods, or areas"
                    {...form.register('preferred_work_locations')}
                  />
                  {form.formState.errors.preferred_work_locations && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.preferred_work_locations.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commute_mode">Primary Commute Method</Label>
                  <Controller
                    control={form.control}
                    name="commute_mode"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select commute method" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Own vehicle', 'Public transportation', 'Walking/Biking', 'Rideshare services'].map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.commute_mode && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.commute_mode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Background & Verification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Background & Verification</h3>
              <Separator />
              
              <div className="grid gap-4">
                <div className="flex items-start space-x-2">
                  <Controller
                    control={form.control}
                    name="background_check"
                    render={({ field }) => (
                      <Checkbox
                        id="background_check"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="background_check">Background Check</Label>
                    <p className="text-sm text-muted-foreground">
                      I am willing to undergo a background check if required
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={form.control}
                    name="legally_authorized"
                    render={({ field }) => (
                      <Checkbox
                        id="legally_authorized"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="legally_authorized">Work Authorization</Label>
                    <p className="text-sm text-muted-foreground">
                      I am legally authorized to work in the country
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medical Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Medical Information</h3>
              <Separator />
              
              <div className="space-y-2">
                <Label>Medical Conditions (If applicable)</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  <Controller
                    control={form.control}
                    name="medical_conditions"
                    render={({ field }) => (
                      <>
                        {medicalConditionOptions.map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={`condition-${condition}`}
                              checked={field.value?.includes(condition)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), condition]
                                  : (field.value || []).filter((value) => value !== condition);
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor={`condition-${condition}`} className="text-sm">
                              {condition}
                            </Label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>
              
              {form.watch('medical_conditions')?.includes('Other') && (
                <div className="space-y-2">
                  <Label htmlFor="other_medical_condition">Other Medical Condition</Label>
                  <Input
                    id="other_medical_condition"
                    placeholder="Please specify other condition"
                    {...form.register('other_medical_condition')}
                  />
                </div>
              )}
            </div>
            
            {/* Profile & Bio Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile & Bio</h3>
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell families about your professional background and experience"
                  className="min-h-32"
                  {...form.register('bio')}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="why_choose_caregiving">Why You Choose Caregiving</Label>
                <Textarea
                  id="why_choose_caregiving"
                  placeholder="Share why you're passionate about providing care"
                  className="min-h-32"
                  {...form.register('why_choose_caregiving')}
                />
                {form.formState.errors.why_choose_caregiving && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.why_choose_caregiving.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* Visibility & Notifications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Visibility & Notifications</h3>
              <Separator />
              
              <div className="grid gap-4">
                <div className="flex items-start space-x-2">
                  <Controller
                    control={form.control}
                    name="list_in_directory"
                    render={({ field }) => (
                      <Checkbox
                        id="list_in_directory"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="list_in_directory">Professional Directory Listing</Label>
                    <p className="text-sm text-muted-foreground">
                      List my profile in the public professional directory
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={form.control}
                    name="enable_job_alerts"
                    render={({ field }) => (
                      <Checkbox
                        id="enable_job_alerts"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="enable_job_alerts">Job Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about new care opportunities
                    </p>
                  </div>
                </div>
                
                {form.watch('enable_job_alerts') && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="job_notification_method">Preferred Notification Method</Label>
                    <Controller
                      control={form.control}
                      name="job_notification_method"
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select notification preference" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Email', 'SMS', 'Both Email and SMS', 'In-app only'].map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Terms & Conditions Section */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Controller
                  control={form.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <Checkbox
                      id="terms_accepted"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="space-y-1">
                  <Label htmlFor="terms_accepted">Terms and Conditions</Label>
                  <p className="text-sm text-muted-foreground">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
              {form.formState.errors.terms_accepted && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.terms_accepted.message}
                </p>
              )}
            </div>
            
            <CardFooter className="flex justify-between border-t pt-6 px-0">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
