
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ImagePlus } from "lucide-react";

import { supabase, ensureAuthContext, checkSupabaseConnection } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Define the form schema with Zod
const formSchema = z.object({
  professionalType: z.string().min(1, "Professional type is required"),
  licenseNumber: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  otherCertification: z.string().optional(),
  careServices: z.array(z.string()).min(1, "Please select at least one care service"),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
  workType: z.string().min(1, "Work type is required"),
  availability: z.array(z.string()).min(1, "Please select at least one availability option"),
  backgroundCheck: z.boolean().optional(),
  legallyAuthorized: z.boolean(),
  expectedRate: z.string().min(1, "Expected rate is required"),
  paymentMethods: z.array(z.string()).min(1, "Please select at least one payment method"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  whyChooseCaregiving: z.string().min(10, "Please provide at least 10 characters"),
  preferredWorkLocations: z.string().min(1, "Preferred work locations is required"),
  commuteMode: z.string().optional(),
  listInDirectory: z.boolean().optional(),
  enableJobAlerts: z.boolean().optional(),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
});

// Professional types
const professionalTypes = [
  "Registered Nurse (RN)",
  "Licensed Practical Nurse (LPN)",
  "Certified Nursing Assistant (CNA)",
  "Home Health Aide (HHA)",
  "Personal Care Aide",
  "Physical Therapist",
  "Occupational Therapist",
  "Speech Therapist",
  "Respiratory Therapist",
  "Medical Social Worker",
  "Geriatric Care Manager",
  "Hospice Specialist",
  "Medical Doctor (MD)",
  "Physician Assistant (PA)",
  "Nurse Practitioner (NP)",
  "Other",
];

// Certification options
const certificationOptions = [
  "CPR Certified",
  "First Aid Certified",
  "Certified Nursing Assistant (CNA)",
  "Basic Life Support (BLS)",
  "Advanced Cardiac Life Support (ACLS)",
  "Medication Administration",
  "Hospice and Palliative Care",
  "Dementia Care",
  "Alzheimer's Care",
  "Parkinson's Care",
  "Diabetes Management",
  "Wound Care",
  "Respiratory Care",
  "IV Therapy",
  "Tracheostomy Care",
  "Ventilator Management",
  "Other",
];

// Care service options
const careServiceOptions = [
  "Personal Care",
  "Medication Management",
  "Wound Care",
  "Mobility Assistance",
  "Meal Preparation",
  "Housekeeping",
  "Transportation",
  "Shopping",
  "Companionship",
  "Respite Care",
  "Hospice Care",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Skilled Nursing",
  "Dementia Care",
  "Pain Management",
  "24-Hour Care",
  "Live-In Care",
  "Overnight Care",
  "Other",
];

// Language options
const languageOptions = [
  "English",
  "Spanish",
  "French",
  "Mandarin",
  "Cantonese",
  "Vietnamese",
  "Korean",
  "Russian",
  "Arabic",
  "Tagalog",
  "American Sign Language",
  "Other",
];

// Work type options
const workTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Per Diem",
  "On-Call",
];

// Availability options
const availabilityOptions = [
  "Weekdays",
  "Weekends",
  "Mornings",
  "Afternoons",
  "Evenings",
  "Overnight",
  "24-Hour Care",
  "Live-In",
];

// Payment method options
const paymentMethodOptions = [
  "Direct Deposit",
  "Check",
  "Cash",
  "PayPal",
  "Venmo",
  "Insurance",
  "Medicare",
  "Medicaid",
  "Private Insurance",
  "Long-Term Care Insurance",
  "Other",
];

// Commute mode options
const commuteModeOptions = [
  "Own Vehicle",
  "Public Transportation",
  "Rideshare",
  "Walking",
  "Biking",
  "Other",
];

export default function ProfessionalRegistration() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [backgroundCheckFile, setBackgroundCheckFile] = useState<File | null>(null);
  const [backgroundCheckUrl, setBackgroundCheckUrl] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [formPreserved, setFormPreserved] = useState(false);

  // Define form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalType: "",
      licenseNumber: "",
      certifications: [],
      otherCertification: "",
      careServices: [],
      languages: ["English"],
      yearsOfExperience: "",
      workType: "",
      availability: [],
      backgroundCheck: false,
      legallyAuthorized: false,
      expectedRate: "",
      paymentMethods: [],
      bio: "",
      whyChooseCaregiving: "",
      preferredWorkLocations: "",
      commuteMode: "",
      listInDirectory: false,
      enableJobAlerts: false,
      fullName: user?.user_metadata?.full_name || "",
      phoneNumber: "",
      address: "",
    },
  });

  // Check connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected);
        if (!isConnected && retryCount < 3) {
          // Exponential backoff retry: 1s, 2s, 4s
          const backoffTime = 1000 * Math.pow(2, retryCount);
          console.log(`Connection failed, retrying in ${backoffTime}ms...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, backoffTime);
        } else if (!isConnected) {
          toast.error("Unable to connect to the database. Please check your internet connection and try again later.");
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setConnectionStatus(false);
      }
    };

    checkConnection();
  }, [retryCount]);

  // Load existing professional profile if available
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        await ensureAuthContext();
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Could not load your profile information. Please try again later.");
          return;
        }

        if (profile) {
          console.log("Loaded profile:", profile);
          
          // Set form values from profile
          form.reset({
            professionalType: profile.professional_type || "",
            licenseNumber: profile.license_number || "",
            certifications: profile.certifications || [],
            otherCertification: profile.other_certification || "",
            careServices: profile.care_services || [],
            languages: profile.languages || ["English"],
            yearsOfExperience: profile.years_of_experience || "",
            workType: profile.work_type || "",
            availability: profile.availability || [],
            backgroundCheck: profile.background_check || false,
            legallyAuthorized: profile.legally_authorized || false,
            expectedRate: profile.expected_rate || "",
            paymentMethods: profile.payment_methods || [],
            bio: profile.bio || "",
            whyChooseCaregiving: profile.why_choose_caregiving || "",
            preferredWorkLocations: profile.preferred_work_locations || "",
            commuteMode: profile.commute_mode || "",
            listInDirectory: profile.list_in_directory || false,
            enableJobAlerts: profile.enable_job_alerts || false,
            fullName: profile.full_name || user?.user_metadata?.full_name || "",
            phoneNumber: profile.phone_number || "",
            address: profile.address || "",
          });

          // Set avatar if exists
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }

          // Set certificate URL if exists
          if (profile.certification_proof_url) {
            setCertificateUrl(profile.certification_proof_url);
          }

          // Set background check URL if exists
          if (profile.background_check_proof_url) {
            setBackgroundCheckUrl(profile.background_check_proof_url);
          }

          setFormPreserved(true);
        }
      } catch (err) {
        console.error("Error in loadExistingProfile:", err);
        toast.error("Failed to load your profile. Please try refreshing the page.");
      }
    };

    if (user && !authLoading) {
      loadExistingProfile();
    }
  }, [user, authLoading, form]);

  // Navigate away if user role is not professional
  useEffect(() => {
    if (!authLoading && userRole && userRole !== "professional") {
      toast.error(`You are registered as a ${userRole}. To access this page, you must register as a professional.`);
      navigate(`/registration/${userRole}`);
    }
  }, [userRole, authLoading, navigate]);

  // Upload files to storage
  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    if (!file) return null;
    
    try {
      // Validate file type and size
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        toast.error(`Invalid file type. Please upload a ${allowedTypes.join(', ')} file.`);
        return null;
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size is 5MB.`);
        return null;
      }

      // Check if storage bucket exists
      await ensureAuthContext();
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error("Error checking storage buckets:", bucketError);
        toast.error("Storage system unavailable. Profile will be saved without the file.");
        return null;
      }
      
      // Create bucket if it doesn't exist
      if (!buckets.some(b => b.name === bucket)) {
        const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
          public: bucket === 'avatars'
        });
        
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          toast.error("Storage system unavailable. Profile will be saved without the file.");
          return null;
        }
      }

      // Set up timeout for upload operations
      const timeoutId = setTimeout(() => {
        console.error("Upload operation timed out after 30 seconds");
        toast.error("File upload timed out. Try again with a smaller file or better connection.");
      }, 30000); // 30s timeout
      
      // Upload with retries
      let uploadError = null;
      let uploadData = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Create unique file path
          const filePath = `${path}/${user!.id}/${Date.now()}.${fileExt}`;
          
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
            
            // Wait before retry (exponential backoff)
            if (attempt < maxRetries - 1) {
              await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            }
          } else {
            uploadData = data;
            uploadError = null;
            break; // Successful upload, exit retry loop
          }
        } catch (err) {
          console.error(`Upload attempt ${attempt + 1} exception:`, err);
          uploadError = err;
        }
      }
      
      clearTimeout(timeoutId);
      
      if (uploadError || !uploadData) {
        console.error("All upload attempts failed:", uploadError);
        toast.error("Failed to upload file. Your profile will be saved without it.");
        return null;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);
        
      console.log("File uploaded successfully:", publicUrl.publicUrl);
      return publicUrl.publicUrl;
      
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      toast.error("An unexpected error occurred during file upload. Your profile will be saved without it.");
      return null;
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle certificate upload
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateFile(file);
      
      // Show filename for non-image files
      if (file.type.startsWith('application/')) {
        setCertificateUrl(file.name);
      } else {
        // Create preview for images
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setCertificateUrl(event.target.result.toString());
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle background check document upload
  const handleBackgroundCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundCheckFile(file);
      
      // Show filename for non-image files
      if (file.type.startsWith('application/')) {
        setBackgroundCheckUrl(file.name);
      } else {
        // Create preview for images
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setBackgroundCheckUrl(event.target.result.toString());
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to complete registration.");
      navigate("/auth");
      return;
    }

    if (!connectionStatus) {
      toast.error("Cannot complete registration - database connection is unavailable. Please try again later.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);
      console.log("Form values:", values);

      // Upload files concurrently
      const uploadTasks = [];

      if (avatar) {
        uploadTasks.push(uploadFile(avatar, 'avatars', 'profile-pictures'));
      }

      if (certificateFile) {
        uploadTasks.push(uploadFile(certificateFile, 'documents', 'certifications'));
      } else {
        uploadTasks.push(null);
      }

      if (backgroundCheckFile) {
        uploadTasks.push(uploadFile(backgroundCheckFile, 'documents', 'background-checks'));
      } else {
        uploadTasks.push(null);
      }

      setUploadProgress(30);
      const [newAvatarUrl, newCertUrl, newBackgroundUrl] = await Promise.all(uploadTasks);
      setUploadProgress(70);

      // Ensure authentication context is valid
      const authValid = await ensureAuthContext();
      if (!authValid) {
        toast.error("Authentication session expired. Please login again.");
        navigate("/auth");
        return;
      }

      // Prepare profile data
      const profileData = {
        id: user.id,
        role: 'professional',
        full_name: values.fullName,
        phone_number: values.phoneNumber,
        address: values.address,
        avatar_url: newAvatarUrl || avatarUrl,
        
        // Professional-specific fields
        professional_type: values.professionalType,
        license_number: values.licenseNumber,
        certifications: values.certifications,
        other_certification: values.otherCertification,
        certification_proof_url: newCertUrl || certificateUrl,
        care_services: values.careServices,
        languages: values.languages,
        years_of_experience: values.yearsOfExperience,
        work_type: values.workType,
        availability: values.availability,
        background_check: values.backgroundCheck,
        background_check_proof_url: newBackgroundUrl || backgroundCheckUrl,
        legally_authorized: values.legallyAuthorized,
        expected_rate: values.expectedRate,
        payment_methods: values.paymentMethods,
        bio: values.bio,
        why_choose_caregiving: values.whyChooseCaregiving,
        preferred_work_locations: values.preferredWorkLocations,
        commute_mode: values.commuteMode,
        list_in_directory: values.listInDirectory,
        enable_job_alerts: values.enableJobAlerts
      };

      // Update profile in database with retry logic
      let profileError = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          setUploadProgress(80 + (attempt * 5));
          console.log(`Profile update attempt ${attempt + 1}`);
          
          // Verify auth context again before each attempt
          await ensureAuthContext();
          
          const { error } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });
            
          if (error) {
            console.error(`Profile update attempt ${attempt + 1} failed:`, error);
            profileError = error;
            
            if (error.message.includes("violates row-level security policy")) {
              console.error("RLS violation detected. Attempting to verify user session...");
              const { data } = await supabase.auth.getSession();
              
              if (!data.session) {
                toast.error("Your session has expired. Please login again.");
                navigate("/auth");
                return;
              }
            }
            
            // Wait before retry (exponential backoff)
            if (attempt < maxRetries - 1) {
              await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            }
          } else {
            profileError = null;
            break; // Successful update, exit retry loop
          }
        } catch (err) {
          console.error(`Profile update attempt ${attempt + 1} exception:`, err);
          profileError = err;
        }
      }
      
      setUploadProgress(100);
      
      if (profileError) {
        console.error("All profile update attempts failed:", profileError);
        
        // Preserve form data
        localStorage.setItem('professional_form_data', JSON.stringify(values));
        setFormPreserved(true);
        
        if (profileError.message?.includes("violates row-level security policy")) {
          toast.error(
            "Your profile couldn't be updated due to a permissions issue. This is likely due to your session expiring. Please log out and back in, then try again."
          );
        } else {
          toast.error(
            "Failed to update your profile after multiple attempts. Your form data has been saved. Please try again later."
          );
        }
        
        return;
      }

      // Success - navigate to dashboard
      toast.success("Professional profile updated successfully!");
      navigate("/dashboard/professional");
      
    } catch (error: any) {
      console.error("Unexpected error during profile update:", error);
      
      // Preserve form data
      localStorage.setItem('professional_form_data', JSON.stringify(values));
      setFormPreserved(true);
      
      toast.error(`An unexpected error occurred: ${error.message || "Unknown error"}. Your form data has been saved.`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const restoreForm = () => {
    try {
      const savedData = localStorage.getItem('professional_form_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
        toast.success("Form data restored from your last attempt");
      }
    } catch (err) {
      console.error("Error restoring form data:", err);
      toast.error("Could not restore your previous form data");
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Professional Registration</h1>
          <p className="mb-4">You must be logged in to register as a professional.</p>
          <Button onClick={() => navigate("/auth")}>Sign In / Sign Up</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Professional Registration</h1>
      </div>

      {!connectionStatus && (
        <Card className="bg-amber-50 p-4 mb-6 border-amber-200">
          <p className="text-amber-800">
            <strong>Connection Status:</strong> Offline or Unable to Connect
          </p>
          <p className="text-amber-600 text-sm mt-1">
            Changes to your profile may not be saved until connection is restored.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => setRetryCount(prev => prev + 1)}
          >
            Retry Connection
          </Button>
        </Card>
      )}

      {formPreserved && (
        <Card className="bg-blue-50 p-4 mb-6 border-blue-200">
          <p className="text-blue-800">
            <strong>Form Data Preserved</strong>
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Your previous form data has been saved. You can continue from where you left off.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={restoreForm}
          >
            Restore Saved Data
          </Button>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Input 
                      id="avatar" 
                      type="file" 
                      onChange={handleAvatarChange} 
                      className="max-w-xs"
                      accept="image/*"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Square image, max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
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
                        {professionalTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number (if applicable)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="License number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certifications"
                render={() => (
                  <FormItem className="md:col-span-2">
                    <div className="mb-2">
                      <FormLabel>Certifications</FormLabel>
                      <FormDescription>
                        Select all certifications that apply
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {certificationOptions.map((certification) => (
                        <FormField
                          key={certification}
                          control={form.control}
                          name="certifications"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={certification}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(certification)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, certification])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== certification
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {certification}
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
                name="otherCertification"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Other Certifications</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Please specify any other certifications" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormLabel>Certification Proof</FormLabel>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <Input 
                      id="certificationProof" 
                      type="file" 
                      onChange={handleCertificateChange} 
                      className="max-w-xs"
                      accept="image/*,application/pdf"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload proof of certification (PDF or image, max 5MB)
                    </p>
                  </div>
                  {certificateUrl && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      {certificateUrl.startsWith('data:image') ? (
                        <span>Image uploaded ✓</span>
                      ) : certificateUrl.startsWith('http') ? (
                        <span>File already uploaded ✓</span>
                      ) : (
                        <span>{certificateUrl} ✓</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="careServices"
                render={() => (
                  <FormItem className="md:col-span-2">
                    <div className="mb-2">
                      <FormLabel>Care Services</FormLabel>
                      <FormDescription>
                        Select all services you can provide
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {careServiceOptions.map((service) => (
                        <FormField
                          key={service}
                          control={form.control}
                          name="careServices"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={service}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, service])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== service
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {service}
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
                name="languages"
                render={() => (
                  <FormItem className="md:col-span-2">
                    <div className="mb-2">
                      <FormLabel>Languages</FormLabel>
                      <FormDescription>
                        Select all languages you speak fluently
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {languageOptions.map((language) => (
                        <FormField
                          key={language}
                          control={form.control}
                          name="languages"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={language}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(language)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, language])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== language
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {language}
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
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select years of experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="6-10 years">6-10 years</SelectItem>
                        <SelectItem value="More than 10 years">More than 10 years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Work Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={() => (
                  <FormItem className="md:col-span-2">
                    <div className="mb-2">
                      <FormLabel>Availability</FormLabel>
                      <FormDescription>
                        Select all that apply to your availability
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availabilityOptions.map((option) => (
                        <FormField
                          key={option}
                          control={form.control}
                          name="availability"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {option}
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
                name="backgroundCheck"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 md:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I have completed a background check</FormLabel>
                      <FormDescription>
                        Background checks help ensure safety and trust
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormLabel>Background Check Proof</FormLabel>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <Input 
                      id="backgroundCheckProof" 
                      type="file" 
                      onChange={handleBackgroundCheckChange} 
                      className="max-w-xs"
                      accept="image/*,application/pdf"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload proof of background check (PDF or image, max 5MB)
                    </p>
                  </div>
                  {backgroundCheckUrl && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      {backgroundCheckUrl.startsWith('data:image') ? (
                        <span>Image uploaded ✓</span>
                      ) : backgroundCheckUrl.startsWith('http') ? (
                        <span>File already uploaded ✓</span>
                      ) : (
                        <span>{backgroundCheckUrl} ✓</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="legallyAuthorized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 md:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        required
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I am legally authorized to work</FormLabel>
                      <FormDescription>
                        I confirm that I am legally authorized to work in this country
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
                    <FormLabel>Expected Pay Rate</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. $25/hour or $250/day" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethods"
                render={() => (
                  <FormItem className="md:col-span-2">
                    <div className="mb-2">
                      <FormLabel>Accepted Payment Methods</FormLabel>
                      <FormDescription>
                        Select all payment methods you accept
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {paymentMethodOptions.map((method) => (
                        <FormField
                          key={method}
                          control={form.control}
                          name="paymentMethods"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={method}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(method)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, method])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== method
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {method}
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

          <Separator />

          {/* Bio & Additional Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About You</h2>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell us about your professional background and experience" 
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      This will appear on your profile for families to see
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whyChooseCaregiving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Did You Choose Caregiving?</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Share why you are passionate about caregiving" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredWorkLocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Work Locations</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. North Seattle, Downtown, Bellevue" 
                      />
                    </FormControl>
                    <FormDescription>
                      List areas where you're willing to work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commuteMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How do you commute?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commuteModeOptions.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
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

          <Separator />

          {/* Preferences Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="listInDirectory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Include me in care provider directory</FormLabel>
                      <FormDescription>
                        Allow families to find your profile in the provider directory
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableJobAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Receive job alerts</FormLabel>
                      <FormDescription>
                        Get notified when new care opportunities match your profile
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submission */}
          <div className="pt-4">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <p className="text-sm mb-1">Updating your profile: {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>Save Professional Profile</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
