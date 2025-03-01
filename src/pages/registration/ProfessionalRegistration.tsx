
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const professionalRoles = [
  { value: "professional_agency", label: "👨‍👦 Professional Agency" },
  { value: "licensed_nurse", label: "🏥 Licensed Nurse (LPN/RN/BSN)" },
  { value: "home_health_aide", label: "🏠 Home Health Aide (HHA)" },
  { value: "nursing_assistant", label: "👩‍⚕️ Certified Nursing Assistant (CNA)" },
  { value: "special_needs_caregiver", label: "🧠 Special Needs Caregiver (Autism, ADHD, Down Syndrome, etc.)" },
  { value: "physical_therapist", label: "🏋️ Physical / Occupational Therapist" },
  { value: "nutritional_specialist", label: "🍽️ Nutritional & Dietary Specialist" },
  { value: "medication_expert", label: "💊 Medication Management Expert" },
  { value: "elderly_support", label: "👨‍🦽 Elderly & Mobility Support (Alzheimer's, Dementia, Parkinson's)" },
  { value: "holistic_care", label: "🌱 Holistic Care & Wellness (Herbal, Alternative Therapy, Meditation, Yoga, etc.)" },
  { value: "gapp", label: "👨‍👦 The Geriatric Adolescent Partnership Programme (GAPP)" },
  { value: "other", label: "⚕️ Other (Specify in Additional Notes)" },
];

const experienceRanges = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const contactMethods = [
  { value: "call", label: "📞 Phone Call" },
  { value: "text", label: "💬 Text Message" },
  { value: "email", label: "📧 Email" },
  { value: "app", label: "📱 App Messaging" },
];

const careTypes = [
  { id: "in_home_care", label: "🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)" },
  { id: "medical_support", label: "🏥 Medical Support (Post-surgery, Chronic Conditions, Hospice)" },
  { id: "special_needs", label: "🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)" },
  { id: "cognitive_care", label: "🧠 Cognitive & Memory Care (Alzheimer's, Dementia, Parkinson's)" },
  { id: "mobility_assistance", label: "♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)" },
  { id: "medication_management", label: "💊 Medication Management (Administering Medication, Medical Equipment)" },
  { id: "nutritional_assistance", label: "🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)" },
  { id: "household_assistance", label: "🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden)" },
];

const medicalConditions = [
  { id: "alzheimers_dementia", label: "🧠 Alzheimer's / Dementia / Cognitive Decline" },
  { id: "cancer", label: "🏥 Cancer Patients (Palliative/Hospice Care)" },
  { id: "parkinsons_stroke", label: "👨‍🦽 Parkinson's / Stroke Recovery / Paralysis" },
  { id: "special_needs", label: "🧩 Special Needs (Autism, ADHD, Cerebral Palsy, etc.)" },
  { id: "chronic_illnesses", label: "💊 Chronic Illnesses (Diabetes, Heart Disease, Kidney Disease, etc.)" },
  { id: "post_surgical", label: "🩺 Post-Surgical Rehabilitation" },
  { id: "bedridden", label: "🛏️ Bedridden Patients (Full-time care, Hygiene Assistance, etc.)" },
];

const workHours = [
  { id: "daytime", label: "☀️ Daytime (8 AM - 5 PM)" },
  { id: "night_shifts", label: "🌙 Night Shifts (5 PM - 8 AM)" },
  { id: "weekends", label: "📆 Weekends Only" },
  { id: "live_in", label: "🏡 Live-In Care (Full-time in-home support)" },
  { id: "flexible", label: "⏳ Flexible / On-Demand Availability" },
];

const workWithOptions = [
  { value: "agencies", label: "🏥 Care Agencies" },
  { value: "private", label: "👩‍⚕️ Private Independent Care (Freelance)" },
  { value: "both", label: "🔀 Both (Agency & Independent Work Available)" },
];

const familyMatching = [
  { id: "elderly_care", label: "🏡 Elderly Care Only" },
  { id: "children_special_needs", label: "🧒 Children / Special Needs Care Only" },
  { id: "medical_rehab", label: "🏥 Medical & Rehabilitation Patients" },
  { id: "mobility_hospice", label: "♿ Mobility & Hospice Care" },
  { id: "open_to_all", label: "🔀 Open to All Matches" },
];

const comfortableWith = [
  { id: "administering_medication", label: "💊 Administering Medication" },
  { id: "housekeeping", label: "🧹 Housekeeping / Meal Preparation" },
  { id: "transportation", label: "🚗 Transportation for Appointments" },
  { id: "medical_equipment", label: "🩺 Handling Medical Equipment" },
];

export default function ProfessionalRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      professionalRole: "",
      yearsOfExperience: "",
      certifications: "",
      location: "",
      phoneNumber: "",
      email: user?.email || "",
      preferredContactMethod: "",
      careTypes: [] as string[],
      medicalConditions: [] as string[],
      otherMedicalCondition: "",
      availability: [] as string[],
      workWith: "private",
      familyMatching: [] as string[],
      comfortableWith: [] as string[],
      backgroundCheckConsent: false,
      liabilityInsurance: false,
      emergencyContact: "",
      hourlyRate: "",
      additionalNotes: "",
      agreeToTerms: false,
    },
  });

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/profile.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(`Avatar upload failed: ${error.message}`);
      return null;
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setAvatarFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: any) => {
    if (!user) {
      toast.error("You must be logged in to complete registration");
      navigate("/auth");
      return;
    }

    if (!data.agreeToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      // Upload avatar if selected
      let avatarPublicUrl = null;
      if (avatarFile) {
        avatarPublicUrl = await uploadAvatar();
      }

      // Prepare profile data
      const profileData = {
        id: user.id,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        role: "professional",
        professional_type: data.professionalRole,
        years_of_experience: data.yearsOfExperience,
        certifications: data.certifications ? [data.certifications] : [],
        location: data.location,
        phone_number: data.phoneNumber,
        preferred_contact_method: data.preferredContactMethod,
        care_services: data.careTypes,
        medical_conditions_experience: data.medicalConditions,
        other_medical_condition: data.otherMedicalCondition,
        availability: data.availability,
        work_type: data.workWith,
        emergency_contact: data.emergencyContact,
        hourly_rate: data.hourlyRate,
        additional_professional_notes: data.additionalNotes,
        administers_medication: data.comfortableWith.includes("administering_medication"),
        provides_housekeeping: data.comfortableWith.includes("housekeeping"),
        provides_transportation: data.comfortableWith.includes("transportation"),
        handles_medical_equipment: data.comfortableWith.includes("medical_equipment"),
        background_check: data.backgroundCheckConsent,
        has_liability_insurance: data.liabilityInsurance,
        avatar_url: avatarPublicUrl,
        updated_at: new Date().toISOString(),
      };

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (updateError) {
        throw updateError;
      }

      toast.success("Registration completed successfully!");
      navigate("/dashboards/professional");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Professional Registration</CardTitle>
          <CardDescription className="text-lg">
            Complete your profile to connect with families and showcase your professional services.
          </CardDescription>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                <span className="text-blue-800 text-xs">🔹</span>
              </div>
              <p className="text-sm text-left">
                <span className="font-medium">Direct Caregiver-to-Family Matching</span> – Ensures families get the right professional for their needs.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                <span className="text-blue-800 text-xs">🔹</span>
              </div>
              <p className="text-sm text-left">
                <span className="font-medium">Smoother Hiring Process</span> – Caregivers can specify exactly what services they provide.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                <span className="text-blue-800 text-xs">🔹</span>
              </div>
              <p className="text-sm text-left">
                <span className="font-medium">Trust & Safety Measures</span> – Background checks, references, and compliance are captured.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                <span className="text-blue-800 text-xs">🔹</span>
              </div>
              <p className="text-sm text-left">
                <span className="font-medium">Availability-Based Matches</span> – Filters caregivers by their schedule, role, and medical expertise.
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal & Contact Information */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-2">Personal & Contact Information</h2>
                <p className="text-muted-foreground mb-6">Tell us about yourself so families can learn more about you.</p>
                
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border overflow-hidden mb-2 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400">👤</div>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="text-sm text-blue-500 cursor-pointer">
                    Upload Profile Picture
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                
                {/* Essential Personal Information */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox checked id="essentialInfo" />
                    <label htmlFor="essentialInfo" className="font-semibold">
                      Essential Personal Information (Required)
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} required />
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
                          <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your last name" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="professionalRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                            Professional Role
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            required
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your professional role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {professionalRoles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
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
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                            Years of Experience
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            required
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your experience range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {experienceRanges.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certifications & Licenses</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any relevant certifications, licenses, or training you have received (CPR, First Aid, Nursing License, etc.)" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            You'll be able to upload supporting documents later
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Contact Information */}
                <div>
                  <h3 className="font-medium mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                            Location
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="City, State, Country" {...field} required />
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
                          <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Email address from your registration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              {contactMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
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
              
              {/* Care Services & Specializations */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-yellow-400 rounded-full w-5 h-5"></div>
                  <h2 className="text-xl font-semibold">Care Services & Specializations</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Tell us about the types of care services you provide. This helps match you with families that need your specific skills.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">What type of care do you provide? (Check all that apply)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {careTypes.map((type) => (
                        <div key={type.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={type.id} 
                            onCheckedChange={(checked) => {
                              const currentValues = form.getValues("careTypes");
                              if (checked) {
                                form.setValue("careTypes", [...currentValues, type.id]);
                              } else {
                                form.setValue(
                                  "careTypes", 
                                  currentValues.filter((value) => value !== type.id)
                                );
                              }
                            }} 
                          />
                          <label htmlFor={type.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">What medical conditions have you worked with? (Select all that apply)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {medicalConditions.map((condition) => (
                        <div key={condition.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={condition.id} 
                            onCheckedChange={(checked) => {
                              const currentValues = form.getValues("medicalConditions");
                              if (checked) {
                                form.setValue("medicalConditions", [...currentValues, condition.id]);
                              } else {
                                form.setValue(
                                  "medicalConditions", 
                                  currentValues.filter((value) => value !== condition.id)
                                );
                              }
                            }} 
                          />
                          <label htmlFor={condition.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {condition.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="otherMedicalCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please specify any other medical conditions you have experience with" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Availability & Matching Preferences */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-yellow-400 rounded-full w-5 h-5"></div>
                  <h2 className="text-xl font-semibold">Availability & Matching Preferences</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Let clients know when and how you prefer to work.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Preferred Work Hours (Select all that apply)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {workHours.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={option.id} 
                            onCheckedChange={(checked) => {
                              const currentValues = form.getValues("availability");
                              if (checked) {
                                form.setValue("availability", [...currentValues, option.id]);
                              } else {
                                form.setValue(
                                  "availability", 
                                  currentValues.filter((value) => value !== option.id)
                                );
                              }
                            }} 
                          />
                          <label htmlFor={option.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Do you work with:</h3>
                    <FormField
                      control={form.control}
                      name="workWith"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your work arrangement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workWithOptions.map((option) => (
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
                  
                  <div>
                    <h3 className="font-medium mb-3">Preferred Family Matching:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {familyMatching.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={option.id} 
                            onCheckedChange={(checked) => {
                              const currentValues = form.getValues("familyMatching");
                              if (checked) {
                                form.setValue("familyMatching", [...currentValues, option.id]);
                              } else {
                                form.setValue(
                                  "familyMatching", 
                                  currentValues.filter((value) => value !== option.id)
                                );
                              }
                            }} 
                          />
                          <label htmlFor={option.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details & Compliance */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-yellow-400 rounded-full w-5 h-5"></div>
                  <h2 className="text-xl font-semibold">Additional Details & Compliance</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Required verification and any additional information.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Are you comfortable with:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {comfortableWith.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={option.id} 
                            onCheckedChange={(checked) => {
                              const currentValues = form.getValues("comfortableWith");
                              if (checked) {
                                form.setValue("comfortableWith", [...currentValues, option.id]);
                              } else {
                                form.setValue(
                                  "comfortableWith", 
                                  currentValues.filter((value) => value !== option.id)
                                );
                              }
                            }} 
                          />
                          <label htmlFor={option.id} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="backgroundCheck" 
                      onCheckedChange={(checked) => {
                        form.setValue("backgroundCheckConsent", checked as boolean);
                      }} 
                    />
                    <label htmlFor="backgroundCheck" className="text-sm">
                      I consent to a background check if required by families
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="liabilityInsurance" 
                      onCheckedChange={(checked) => {
                        form.setValue("liabilityInsurance", checked as boolean);
                      }} 
                    />
                    <label htmlFor="liabilityInsurance" className="text-sm">
                      I have liability insurance (for independent caregivers)
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Name, relationship, phone number" {...field} />
                          </FormControl>
                          <FormDescription>
                            For caregivers' safety
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate / Salary Expectations</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., $25/hour or salary range" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any Additional Notes for Families or Agencies?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share any other information you would like families to know about your services..." 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="agreeToTerms" 
                      onCheckedChange={(checked) => {
                        form.setValue("agreeToTerms", checked as boolean);
                      }} 
                    />
                    <label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the <a href="#" className="text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-500">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing Registration...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
