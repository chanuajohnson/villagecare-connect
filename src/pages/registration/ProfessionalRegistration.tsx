
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, Check, X, User } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserRole } from '@/types/database';

const PROFESSIONAL_TYPES = [
  { value: 'agency', label: '👨‍👦 Professional Agency' },
  { value: 'nurse', label: '🏥 Licensed Nurse (LPN/RN/BSN)' },
  { value: 'hha', label: '🏠 Home Health Aide (HHA)' },
  { value: 'cna', label: '👩‍⚕️ Certified Nursing Assistant (CNA)' },
  { value: 'special_needs', label: '🧠 Special Needs Caregiver' },
  { value: 'therapist', label: '🏋️ Physical / Occupational Therapist' },
  { value: 'nutrition', label: '🍽️ Nutritional & Dietary Specialist' },
  { value: 'medication', label: '💊 Medication Management Expert' },
  { value: 'elderly', label: '👨‍🦽 Elderly & Mobility Support' },
  { value: 'holistic', label: '🌱 Holistic Care & Wellness' },
  { value: 'gapp', label: '👨‍👦 The Geriatric Adolescent Partnership Programme (GAPP)' },
  { value: 'other', label: '⚕️ Other (Please specify)' }
];

const EXPERIENCE_RANGES = [
  { value: '0-1', label: '0-1 years' },
  { value: '2-5', label: '2-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' }
];

const CARE_SERVICES = [
  { id: 'in_home', label: '🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)' },
  { id: 'medical', label: '🏥 Medical Support (Post-surgery, Chronic Condition Management, Hospice)' },
  { id: 'special_needs', label: '🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)' },
  { id: 'cognitive', label: '🧠 Cognitive & Memory Care (Alzheimer\'s, Dementia, Parkinson\'s)' },
  { id: 'mobility', label: '♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)' },
  { id: 'medication', label: '💊 Medication Management (Administering Medication, Insulin, Medical Equipment)' },
  { id: 'nutrition', label: '🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)' },
  { id: 'household', label: '🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)' }
];

const MEDICAL_CONDITIONS = [
  { id: 'alzheimers', label: '🧠 Alzheimer\'s / Dementia / Cognitive Decline' },
  { id: 'cancer', label: '🏥 Cancer Patients (Palliative/Hospice Care)' },
  { id: 'parkinsons', label: '👨‍🦽 Parkinson\'s / Stroke Recovery / Paralysis' },
  { id: 'special_needs', label: '🧩 Special Needs (Autism, ADHD, Cerebral Palsy, etc.)' },
  { id: 'chronic', label: '💊 Chronic Illnesses (Diabetes, Heart Disease, Kidney Disease, etc.)' },
  { id: 'post_surgical', label: '🩺 Post-Surgical Rehabilitation' },
  { id: 'bedridden', label: '🛏️ Bedridden Patients (Full-time care, Hygiene Assistance, etc.)' }
];

const AVAILABILITY_OPTIONS = [
  { id: 'daytime', label: '☀️ Daytime (8 AM - 5 PM)' },
  { id: 'night', label: '🌙 Night Shifts (5 PM - 8 AM)' },
  { id: 'weekends', label: '📆 Weekends Only' },
  { id: 'live_in', label: '🏡 Live-In Care (Full-time in-home support)' },
  { id: 'flexible', label: '⏳ Flexible / On-Demand Availability' }
];

const WORK_TYPE_OPTIONS = [
  { value: 'agency', label: '🏥 Care Agencies' },
  { value: 'independent', label: '👩‍⚕️ Private Independent Care (Freelance)' },
  { value: 'both', label: '🔀 Both (Agency & Independent Work Available)' }
];

const FAMILY_MATCH_OPTIONS = [
  { id: 'elderly', label: '🏡 Elderly Care Only' },
  { id: 'children', label: '🧒 Children / Special Needs Care Only' },
  { id: 'medical', label: '🏥 Medical & Rehabilitation Patients' },
  { id: 'mobility', label: '♿ Mobility & Hospice Care' },
  { id: 'all', label: '🔀 Open to All Matches' }
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'call', label: 'Phone Call' },
  { value: 'text', label: 'Text Message' },
  { value: 'email', label: 'Email' },
  { value: 'app', label: 'App Messaging' }
];

export default function ProfessionalRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [backgroundCheckFile, setBackgroundCheckFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const form = useForm({
    defaultValues: {
      fullName: '',
      professionalType: '',
      otherProfessionalType: '',
      experienceYears: '',
      phoneNumber: '',
      email: '',
      location: '',
      preferredContactMethod: 'email',
      licenseNumber: '',
      careServices: [] as string[],
      medicalConditions: [] as string[],
      otherMedicalCondition: '',
      availability: [] as string[],
      workType: 'independent',
      familyMatchPreferences: [] as string[],
      comfortAreas: {
        medication: false,
        housekeeping: false,
        transportation: false,
        medicalEquipment: false
      },
      emergencyContact: '',
      hasLiabilityInsurance: false,
      expectedRate: '',
      additionalNotes: ''
    }
  });

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          navigate('/auth');
          toast.error("You must be logged in to complete registration");
          return;
        }
        
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setConnectionStatus(error ? false : true);
        
        if (error) {
          console.error("Connection check failed:", error);
          toast.error("Database connection issue detected. Please try again later.");
        }
      } catch (error) {
        console.error("Connection check error:", error);
        setConnectionStatus(false);
        toast.error("Failed to connect to our services. Please check your internet connection.");
      }
    };
    
    checkConnection();
  }, [navigate]);

  // Handle profile picture preview
  useEffect(() => {
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(profilePicture);
    } else {
      setPreviewUrl(null);
    }
  }, [profilePicture]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("Profile picture must be less than 5MB");
        return;
      }
      setProfilePicture(file);
    }
  };

  const handleCertificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error("Certification file must be less than 10MB");
        return;
      }
      setCertificationFile(file);
      toast.success(`Certification file "${file.name}" ready for upload`);
    }
  };

  const handleBackgroundCheckUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error("Background check file must be less than 10MB");
        return;
      }
      setBackgroundCheckFile(file);
      toast.success(`Background check file "${file.name}" ready for upload`);
    }
  };

  // Generic file upload function with retries and progress
  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    if (!file || !connectionStatus) {
      console.error("Cannot upload: Missing file or connection issues");
      return null;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      
      // Create file name with extension
      const fileExt = file.name.split('.').pop();
      if (!fileExt) {
        throw new Error("Invalid file type");
      }
      
      // Check if storage bucket exists first
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Failed to list buckets:", bucketsError);
        throw new Error("Storage system unavailable");
      }
      
      // Create bucket if it doesn't exist
      if (!buckets.find(b => b.name === bucket)) {
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: false,
        });
        
        if (createError) {
          console.error("Failed to create bucket:", createError);
          throw new Error("Failed to initialize storage");
        }
      }

      // Set up timeout for upload operations
      const timeoutId = setTimeout(() => {
        console.error("Upload operation timed out after 30 seconds");
        toast.error("File upload timed out. Try again with a smaller file or better connection.");
      }, 30000); // 30s timeout
      
      // Upload with retries
      let uploadError = null;
      let uploadResult = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          setUploadProgress(10 + attempt * 20); // Show progress advancing with each retry
          
          // Create unique file path
          const filePath = `${path}/${Date.now()}.${fileExt}`;
          
          // Upload with proper options (removing the signal property)
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
            
          if (error) {
            console.error(`Upload attempt ${attempt + 1} failed:`, error);
            uploadError = error;
            
            if (attempt < 2) {
              // Wait with exponential backoff before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
              continue;
            } else {
              throw error;
            }
          }
          
          // Get public URL for the file
          const { data: publicURLData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
            
          uploadResult = publicURLData.publicUrl;
          uploadError = null;
          break; // Success, exit retry loop
        } catch (err) {
          console.error(`Upload attempt ${attempt + 1} exception:`, err);
          uploadError = err as Error;
          
          if (attempt < 2) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      
      // Clear timeout if upload completed or failed
      clearTimeout(timeoutId);
      
      if (uploadError) {
        setUploadError(`Upload failed after multiple attempts: ${uploadError.message}`);
        toast.error("Failed to upload file after multiple attempts");
        return null;
      }
      
      setUploadProgress(100);
      return uploadResult;
    } catch (error: any) {
      console.error("File upload error:", error);
      setUploadError(error.message || "Upload failed");
      toast.error(`Upload error: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!connectionStatus) {
      toast.error("Cannot submit registration: No connection to our services");
      return;
    }
    
    setIsLoading(true);
    let avatarUrl = null;
    let certificationUrl = null;
    let backgroundCheckUrl = null;
    
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("Authentication error: " + (userError?.message || "Not logged in"));
      }
      
      const userId = userData.user.id;
      
      // Upload profile picture if provided
      if (profilePicture) {
        toast.info("Uploading profile picture...");
        avatarUrl = await uploadFile(profilePicture, 'avatars', `professional/${userId}`);
        
        if (!avatarUrl) {
          toast.error("Failed to upload profile picture, but continuing with registration");
        } else {
          toast.success("Profile picture uploaded successfully");
        }
      }
      
      // Upload certification if provided
      if (certificationFile) {
        toast.info("Uploading certification document...");
        certificationUrl = await uploadFile(certificationFile, 'certifications', `professional/${userId}`);
        
        if (!certificationUrl) {
          toast.error("Failed to upload certification, but continuing with registration");
        } else {
          toast.success("Certification document uploaded successfully");
        }
      }
      
      // Upload background check if provided
      if (backgroundCheckFile) {
        toast.info("Uploading background check document...");
        backgroundCheckUrl = await uploadFile(backgroundCheckFile, 'background_checks', `professional/${userId}`);
        
        if (!backgroundCheckUrl) {
          toast.error("Failed to upload background check, but continuing with registration");
        } else {
          toast.success("Background check document uploaded successfully");
        }
      }
      
      // Prepare profile data
      const profileData = {
        id: userId,
        full_name: data.fullName,
        role: 'professional' as UserRole,
        avatar_url: avatarUrl,
        phone_number: data.phoneNumber,
        location: data.location,
        
        // Professional-specific fields
        professional_type: data.professionalType,
        other_professional_type: data.professionalType === 'other' ? data.otherProfessionalType : null,
        license_number: data.licenseNumber,
        certification_proof_url: certificationUrl,
        background_check_proof_url: backgroundCheckUrl,
        care_services: data.careServices,
        years_of_experience: data.experienceYears,
        availability: data.availability,
        work_type: data.workType,
        preferred_contact_method: data.preferredContactMethod,
        caregiving_areas: data.medicalConditions,
        other_medical_condition: data.otherMedicalCondition,
        preferred_work_locations: data.familyMatchPreferences.join(', '),
        administers_medication: data.comfortAreas.medication,
        provides_housekeeping: data.comfortAreas.housekeeping,
        provides_transportation: data.comfortAreas.transportation,
        handles_medical_equipment: data.comfortAreas.medicalEquipment,
        emergency_contact: data.emergencyContact,
        has_liability_insurance: data.hasLiabilityInsurance,
        expected_rate: data.expectedRate,
        bio: data.additionalNotes
      };
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      toast.success("Registration completed successfully!");
      
      // Navigate to appropriate dashboard after short delay
      setTimeout(() => {
        navigate('/dashboards/professional');
      }, 1500);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      
      // Preserve form data in case of failure
      localStorage.setItem('professional_registration_data', JSON.stringify(form.getValues()));
    } finally {
      setIsLoading(false);
    }
  };

  // Restore form data if previously saved
  useEffect(() => {
    const savedData = localStorage.getItem('professional_registration_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
        toast.info("Restored your previous form data");
      } catch (e) {
        console.error("Failed to parse saved form data:", e);
        localStorage.removeItem('professional_registration_data');
      }
    }
  }, [form]);

  if (connectionStatus === false) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="w-full">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-700">Connection Error</CardTitle>
            <CardDescription className="text-red-600">
              We're having trouble connecting to our services. Please check your internet connection and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="w-full">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Professional Registration</CardTitle>
          <CardDescription>
            Register as a healthcare professional to connect with families in need of your services.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-8">
              {/* Profile Picture Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Profile Picture</h3>
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                  <div className="relative w-32 h-32 border rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="profile-upload">Professional Photo</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="profile-upload" 
                        type="file" 
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload a professional-looking photo to help families recognize you. Max size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Personal Information Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">✅ Essential Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First and Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EXPERIENCE_RANGES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="professionalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your professional role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROFESSIONAL_TYPES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch('professionalType') === 'other' && (
                    <div className="space-y-2 sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="otherProfessionalType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Please specify your professional role</FormLabel>
                            <FormControl>
                              <Input placeholder="Your professional specialization" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License/Certification Number (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="License or certification number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Certifications & Licenses</Label>
                    <Input 
                      id="certification-upload" 
                      type="file" 
                      onChange={handleCertificationUpload}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">
                      Upload documents like CPR certification, nursing license, etc. Max size: 10MB.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="preferredContactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred contact method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTACT_METHOD_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Care Services */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">🟡 Care Services & Specializations</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="careServices"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What type of care do you provide?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {CARE_SERVICES.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="careServices"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What medical conditions have you worked with?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {MEDICAL_CONDITIONS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="medicalConditions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="otherMedicalCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other medical conditions not listed above</FormLabel>
                        <FormControl>
                          <Input placeholder="Specify other conditions you've worked with" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Availability & Matching */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">🟡 Availability & Matching Preferences</h3>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="availability"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred Work Hours</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {AVAILABILITY_OPTIONS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="availability"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="workType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Do you work with:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {WORK_TYPE_OPTIONS.map(option => (
                              <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option.value} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="familyMatchPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred Family Matching</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2">
                          {FAMILY_MATCH_OPTIONS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="familyMatchPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">🟡 Additional Details & Compliance</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Background Check & References</Label>
                    <Input 
                      id="background-check-upload" 
                      type="file" 
                      onChange={handleBackgroundCheckUpload}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">
                      Upload proof of background check or consent form. Max size: 10MB.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <FormLabel>Are you comfortable with:</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="comfortAreas.medication"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              💊 Administering Medication
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="comfortAreas.housekeeping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              🏡 Housekeeping / Meal Preparation
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="comfortAreas.transportation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              🚗 Transportation for Appointments
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="comfortAreas.medicalEquipment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              🩺 Handling Medical Equipment
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Name and phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          For your safety when providing care
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasLiabilityInsurance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I have liability insurance
                          </FormLabel>
                          <FormDescription>
                            Recommended for independent caregivers
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expectedRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate / Salary Expectations</FormLabel>
                        <FormControl>
                          <Input placeholder="Your expected compensation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes for Families</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell families more about your experience, approach to caregiving, or any other information you'd like to share"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
