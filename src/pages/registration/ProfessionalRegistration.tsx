
import React, { useState, useRef } from 'react';
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
  // Essential Personal Information
  full_name: z.string().min(1, 'Name is required'),
  professional_role: z.string().min(1, 'Professional role is required'),
  years_of_experience: z.string().min(1, 'Years of experience is required'),
  license_number: z.string().optional(),
  
  // Contact Information
  phone_number: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  preferred_contact_method: z.string().min(1, 'Preferred contact method is required'),
  
  // Care Services & Specializations
  care_services: z.array(z.string()).min(1, 'Select at least one care service'),
  medical_conditions: z.array(z.string()).optional(),
  other_medical_conditions: z.string().optional(),
  
  // Availability & Matching Preferences
  work_hours: z.array(z.string()).min(1, 'Select at least one work hour preference'),
  work_type: z.string().min(1, 'Work type is required'),
  family_matching: z.array(z.string()).optional(),
  
  // Additional Details & Compliance
  background_check: z.boolean().optional(),
  comfortable_with: z.array(z.string()).optional(),
  emergency_contact: z.string().optional(),
  liability_insurance: z.boolean().optional(),
  hourly_rate: z.string().optional(),
  additional_notes: z.string().optional(),
  
  // Terms & Conditions
  terms_accepted: z.boolean({
    required_error: 'You must accept the terms and conditions',
  }).refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export default function ProfessionalRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const certificationsRef = useRef<HTMLInputElement>(null);
  const backgroundCheckRef = useRef<HTMLInputElement>(null);
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [certifications, setCertifications] = useState<File | null>(null);
  const [backgroundCheckDoc, setBackgroundCheckDoc] = useState<File | null>(null);
  
  // Form setup
  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      full_name: '',
      professional_role: '',
      years_of_experience: '',
      license_number: '',
      phone_number: '',
      email: user?.email || '',
      location: '',
      preferred_contact_method: 'Email',
      care_services: [],
      medical_conditions: [],
      other_medical_conditions: '',
      work_hours: [],
      work_type: '',
      family_matching: [],
      background_check: false,
      comfortable_with: [],
      emergency_contact: '',
      liability_insurance: false,
      hourly_rate: '',
      additional_notes: '',
      terms_accepted: false,
    },
  });
  
  // Handle file input changes
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePhoto(e.target.files[0]);
    }
  };
  
  const handleCertificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertifications(e.target.files[0]);
    }
  };
  
  const handleBackgroundCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBackgroundCheckDoc(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: ProfessionalFormValues) => {
    if (!user) {
      toast.error('You need to be logged in to register as a professional');
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload profile photo if provided
      let profilePhotoUrl = '';
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `profile-${uuidv4()}.${fileExt}`;
        const filePath = `profiles/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, profilePhoto);
          
        if (uploadError) {
          console.error('Error uploading profile photo:', uploadError);
          toast.error('Error uploading profile photo');
        } else {
          profilePhotoUrl = filePath;
        }
      }
      
      // Upload certifications if provided
      let certificationsUrl = '';
      if (certifications) {
        const fileExt = certifications.name.split('.').pop();
        const fileName = `certification-${uuidv4()}.${fileExt}`;
        const filePath = `documents/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, certifications);
          
        if (uploadError) {
          console.error('Error uploading certifications:', uploadError);
          toast.error('Error uploading certifications');
        } else {
          certificationsUrl = filePath;
        }
      }
      
      // Upload background check if provided
      let backgroundCheckUrl = '';
      if (backgroundCheckDoc) {
        const fileExt = backgroundCheckDoc.name.split('.').pop();
        const fileName = `background-${uuidv4()}.${fileExt}`;
        const filePath = `documents/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, backgroundCheckDoc);
          
        if (uploadError) {
          console.error('Error uploading background check:', uploadError);
          toast.error('Error uploading background check');
        } else {
          backgroundCheckUrl = filePath;
        }
      }
      
      // Update user profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: 'professional',
          professional_type: data.professional_role,
          license_number: data.license_number,
          years_of_experience: data.years_of_experience,
          phone_number: data.phone_number,
          email: data.email,
          location: data.location,
          preferred_contact_method: data.preferred_contact_method,
          care_services: data.care_services,
          medical_conditions: data.medical_conditions,
          other_medical_conditions: data.other_medical_conditions,
          work_hours: data.work_hours,
          work_type: data.work_type,
          family_matching: data.family_matching,
          comfortable_with: data.comfortable_with,
          emergency_contact: data.emergency_contact,
          liability_insurance: data.liability_insurance,
          hourly_rate: data.hourly_rate,
          additional_notes: data.additional_notes,
          profile_photo_url: profilePhotoUrl || null,
          certification_proof_url: certificationsUrl || null,
          background_check_url: backgroundCheckUrl || null,
          background_check: data.background_check,
        })
        .eq('id', user.id);
      
      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
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
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="border-none shadow-md bg-blue-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Professional Registration</CardTitle>
          <CardDescription>
            Register as a healthcare professional to connect with families in need of your services.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Upload Profile Picture Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Profile Picture</h3>
              <Separator />
              
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  {profilePhoto ? (
                    <img 
                      src={URL.createObjectURL(profilePhoto)} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Professional Photo</Label>
                  <Input 
                    type="file" 
                    ref={profilePhotoRef}
                    onChange={handleProfilePhotoChange}
                    accept="image/*"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a professional-looking photo to help families recognize you. Max size: 5MB.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Essential Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="essential" checked={true} disabled />
                <h3 className="text-lg font-medium">Essential Personal Information</h3>
              </div>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Your full name"
                    {...form.register('full_name')}
                  />
                  {form.formState.errors.full_name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
                
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
                          {['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map((years) => (
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
                
                <div className="space-y-2">
                  <Label htmlFor="professional_role">Professional Role</Label>
                  <Controller
                    control={form.control}
                    name="professional_role"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your professional role" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Registered Nurse (RN)',
                            'Licensed Practical Nurse (LPN)',
                            'Certified Nursing Assistant (CNA)',
                            'Home Health Aide (HHA)',
                            'Physical Therapist',
                            'Occupational Therapist',
                            'Speech Therapist',
                            'Social Worker',
                            'Personal Care Aide',
                            'Companion Caregiver',
                            'The Geriatric Adolescent Partnership Programme (GAPP)',
                            'Other'
                          ].map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.professional_role && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.professional_role.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_number">License/Certification Number (if applicable)</Label>
                  <Input
                    id="license_number"
                    placeholder="License or certification number"
                    {...form.register('license_number')}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Certifications & Licenses</Label>
                  <Input 
                    type="file" 
                    ref={certificationsRef}
                    onChange={handleCertificationsChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload documents like CPR certification, nursing license, etc. Max size: 10MB.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    placeholder="Your phone number"
                    {...form.register('phone_number')}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="Your email address"
                    type="email"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State/Province"
                    {...form.register('location')}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                  <Controller
                    control={form.control}
                    name="preferred_contact_method"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred contact method" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Email', 'Phone', 'Text Message'].map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Care Services & Specializations Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white">
                  •
                </div>
                <h3 className="text-lg font-medium">Care Services & Specializations</h3>
              </div>
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What type of care do you provide?</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  
                  <div className="grid gap-2 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="care_services"
                      render={({ field }) => (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="in-home-care"
                              checked={field.value?.includes('In-Home Care')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'In-Home Care']
                                  : (field.value || []).filter(value => value !== 'In-Home Care');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="in-home-care" className="text-sm">
                              🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="medical-support"
                              checked={field.value?.includes('Medical Support')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Medical Support']
                                  : (field.value || []).filter(value => value !== 'Medical Support');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="medical-support" className="text-sm">
                              🏥 Medical Support (Post-surgery, Chronic Condition Management, Hospice)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="special-needs"
                              checked={field.value?.includes('Child or Special Needs Support')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Child or Special Needs Support']
                                  : (field.value || []).filter(value => value !== 'Child or Special Needs Support');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="special-needs" className="text-sm">
                              👶 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="cognitive-memory-care"
                              checked={field.value?.includes('Cognitive & Memory Care')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Cognitive & Memory Care']
                                  : (field.value || []).filter(value => value !== 'Cognitive & Memory Care');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="cognitive-memory-care" className="text-sm">
                              🧠 Cognitive & Memory Care (Alzheimer's, Dementia, Parkinson's)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mobility-assistance"
                              checked={field.value?.includes('Mobility Assistance')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Mobility Assistance']
                                  : (field.value || []).filter(value => value !== 'Mobility Assistance');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="mobility-assistance" className="text-sm">
                              🧑‍🦽 Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="medication-management"
                              checked={field.value?.includes('Medication Management')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Medication Management']
                                  : (field.value || []).filter(value => value !== 'Medication Management');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="medication-management" className="text-sm">
                              💊 Medication Management (Administering Medication, Insulin, Medical Equipment)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="nutritional-assistance"
                              checked={field.value?.includes('Nutritional Assistance')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Nutritional Assistance']
                                  : (field.value || []).filter(value => value !== 'Nutritional Assistance');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="nutritional-assistance" className="text-sm">
                              🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="household-assistance"
                              checked={field.value?.includes('Household Assistance')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Household Assistance']
                                  : (field.value || []).filter(value => value !== 'Household Assistance');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="household-assistance" className="text-sm">
                              🧹 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)
                            </Label>
                          </div>
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
                
                <div className="space-y-2">
                  <Label>What medical conditions have you worked with?</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  
                  <div className="grid gap-2 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="medical_conditions"
                      render={({ field }) => (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="alzheimers-dementia"
                              checked={field.value?.includes("Alzheimer's/Dementia/Cognitive Decline")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), "Alzheimer's/Dementia/Cognitive Decline"]
                                  : (field.value || []).filter(value => value !== "Alzheimer's/Dementia/Cognitive Decline");
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="alzheimers-dementia" className="text-sm">
                              🧠 Alzheimer's / Dementia / Cognitive Decline
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="cancer-patients"
                              checked={field.value?.includes('Cancer Patients')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Cancer Patients']
                                  : (field.value || []).filter(value => value !== 'Cancer Patients');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="cancer-patients" className="text-sm">
                              🏥 Cancer Patients (Palliative/Hospice Care)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="parkinsons-stroke"
                              checked={field.value?.includes("Parkinson's/Stroke Recovery/Paralysis")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), "Parkinson's/Stroke Recovery/Paralysis"]
                                  : (field.value || []).filter(value => value !== "Parkinson's/Stroke Recovery/Paralysis");
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="parkinsons-stroke" className="text-sm">
                              🧩 Parkinson's / Stroke Recovery / Paralysis
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="special-needs-conditions"
                              checked={field.value?.includes('Special Needs')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Special Needs']
                                  : (field.value || []).filter(value => value !== 'Special Needs');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="special-needs-conditions" className="text-sm">
                              👨‍👩‍👧‍👦 Special Needs (Autism, ADHD, Cerebral Palsy, etc.)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="chronic-illnesses"
                              checked={field.value?.includes('Chronic Illnesses')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Chronic Illnesses']
                                  : (field.value || []).filter(value => value !== 'Chronic Illnesses');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="chronic-illnesses" className="text-sm">
                              💔 Chronic Illnesses (Diabetes, Heart Disease, Kidney Disease, etc.)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="post-surgical"
                              checked={field.value?.includes('Post-Surgical Rehabilitation')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Post-Surgical Rehabilitation']
                                  : (field.value || []).filter(value => value !== 'Post-Surgical Rehabilitation');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="post-surgical" className="text-sm">
                              🩹 Post-Surgical Rehabilitation
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="bedridden-patients"
                              checked={field.value?.includes('Bedridden Patients')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Bedridden Patients']
                                  : (field.value || []).filter(value => value !== 'Bedridden Patients');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="bedridden-patients" className="text-sm">
                              🛌 Bedridden Patients (Full-time care, Hygiene Assistance, etc.)
                            </Label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="other_medical_conditions">Other medical conditions not listed above</Label>
                  <Input
                    id="other_medical_conditions"
                    placeholder="Specify other conditions you've worked with"
                    {...form.register('other_medical_conditions')}
                  />
                </div>
              </div>
            </div>
            
            {/* Availability & Matching Preferences Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white">
                  •
                </div>
                <h3 className="text-lg font-medium">Availability & Matching Preferences</h3>
              </div>
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Work Hours</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  
                  <div className="grid gap-2 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="work_hours"
                      render={({ field }) => (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="daytime"
                              checked={field.value?.includes('Daytime')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Daytime']
                                  : (field.value || []).filter(value => value !== 'Daytime');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="daytime" className="text-sm">
                              ☀️ Daytime (8 AM - 5 PM)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="night-shifts"
                              checked={field.value?.includes('Night Shifts')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Night Shifts']
                                  : (field.value || []).filter(value => value !== 'Night Shifts');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="night-shifts" className="text-sm">
                              🌙 Night Shifts (5 PM - 8 AM)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="weekends-only"
                              checked={field.value?.includes('Weekends Only')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Weekends Only']
                                  : (field.value || []).filter(value => value !== 'Weekends Only');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="weekends-only" className="text-sm">
                              📅 Weekends Only
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="live-in-care"
                              checked={field.value?.includes('Live-in Care')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Live-in Care']
                                  : (field.value || []).filter(value => value !== 'Live-in Care');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="live-in-care" className="text-sm">
                              🏡 Live-in Care (Full-time in-home support)
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="flexible"
                              checked={field.value?.includes('Flexible / On-Demand Availability')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Flexible / On-Demand Availability']
                                  : (field.value || []).filter(value => value !== 'Flexible / On-Demand Availability');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="flexible" className="text-sm">
                              🕒 Flexible / On-Demand Availability
                            </Label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                  
                  {form.formState.errors.work_hours && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.work_hours.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Do you work with:</Label>
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
                          <RadioGroupItem value="Care Agencies" id="care-agencies" />
                          <Label htmlFor="care-agencies">🏢 Care Agencies</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Private Independent Care" id="private-care" />
                          <Label htmlFor="private-care">👨‍⚕️ Private Independent Care (Freelance)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Both" id="both" />
                          <Label htmlFor="both">📋 Both (Agency & Independent Work Available)</Label>
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
                  <Label>Preferred Family Matching</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                  
                  <div className="grid gap-2 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="family_matching"
                      render={({ field }) => (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="elderly-care"
                              checked={field.value?.includes('Elderly Care Only')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Elderly Care Only']
                                  : (field.value || []).filter(value => value !== 'Elderly Care Only');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="elderly-care" className="text-sm">
                              👵 Elderly Care Only
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="children-special-needs"
                              checked={field.value?.includes('Children / Special Needs Care Only')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Children / Special Needs Care Only']
                                  : (field.value || []).filter(value => value !== 'Children / Special Needs Care Only');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="children-special-needs" className="text-sm">
                              👶 Children / Special Needs Care Only
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="medical-rehabilitation"
                              checked={field.value?.includes('Medical & Rehabilitation Patients')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Medical & Rehabilitation Patients']
                                  : (field.value || []).filter(value => value !== 'Medical & Rehabilitation Patients');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="medical-rehabilitation" className="text-sm">
                              🏥 Medical & Rehabilitation Patients
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mobility-hospice"
                              checked={field.value?.includes('Mobility & Hospice Care')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Mobility & Hospice Care']
                                  : (field.value || []).filter(value => value !== 'Mobility & Hospice Care');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="mobility-hospice" className="text-sm">
                              🧑‍🦽 Mobility & Hospice Care
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="open-all-matches"
                              checked={field.value?.includes('Open to All Matches')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Open to All Matches']
                                  : (field.value || []).filter(value => value !== 'Open to All Matches');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="open-all-matches" className="text-sm">
                              📋 Open to All Matches
                            </Label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Details & Compliance Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-white">
                  •
                </div>
                <h3 className="text-lg font-medium">Additional Details & Compliance</h3>
              </div>
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Background Check & References</Label>
                  <Input 
                    type="file" 
                    ref={backgroundCheckRef}
                    onChange={handleBackgroundCheckChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload proof of background check or consent form. Max size: 10MB.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Are you comfortable with:</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="comfortable_with"
                      render={({ field }) => (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="administering-medication"
                              checked={field.value?.includes('Administering Medication')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Administering Medication']
                                  : (field.value || []).filter(value => value !== 'Administering Medication');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="administering-medication" className="text-sm">
                              💊 Administering Medication
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="housekeeping-meal"
                              checked={field.value?.includes('Housekeeping / Meal Preparation')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Housekeeping / Meal Preparation']
                                  : (field.value || []).filter(value => value !== 'Housekeeping / Meal Preparation');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="housekeeping-meal" className="text-sm">
                              🧹 Housekeeping / Meal Preparation
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="transportation"
                              checked={field.value?.includes('Transportation for Appointments')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Transportation for Appointments']
                                  : (field.value || []).filter(value => value !== 'Transportation for Appointments');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="transportation" className="text-sm">
                              🚗 Transportation for Appointments
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="handling-equipment"
                              checked={field.value?.includes('Handling Medical Equipment')}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), 'Handling Medical Equipment']
                                  : (field.value || []).filter(value => value !== 'Handling Medical Equipment');
                                field.onChange(updatedValue);
                              }}
                            />
                            <Label htmlFor="handling-equipment" className="text-sm">
                              🩺 Handling Medical Equipment
                            </Label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    placeholder="Name and phone number"
                    {...form.register('emergency_contact')}
                  />
                  <p className="text-xs text-muted-foreground">
                    For your safety when providing care
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={form.control}
                    name="liability_insurance"
                    render={({ field }) => (
                      <Checkbox
                        id="liability_insurance"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="liability_insurance">I have liability insurance</Label>
                    <p className="text-xs text-muted-foreground">
                      Recommended for independent caregivers
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate / Salary Expectations</Label>
                  <Input
                    id="hourly_rate"
                    placeholder="Your expected compensation"
                    {...form.register('hourly_rate')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additional_notes">Additional Notes for Families</Label>
                  <Textarea
                    id="additional_notes"
                    placeholder="Tell families more about your experience, approach to caregiving, or any other information you'd like to share"
                    className="min-h-32"
                    {...form.register('additional_notes')}
                  />
                </div>
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
            
            <CardFooter className="flex justify-between px-0">
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
