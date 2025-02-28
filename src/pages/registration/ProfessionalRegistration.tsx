
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2, Upload } from 'lucide-react';

export default function ProfessionalRegistration() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    professionalType: '',
    licenseNumber: '',
    yearsOfExperience: '',
    workType: '',
    bio: '',
    whyChooseCaregiving: '',
    expectedRate: '',
    preferredWorkLocations: '',
    commuteMode: '',
    backgroundCheck: false,
    legallyAuthorized: false,
    listInDirectory: false,
    enableJobAlerts: false,
    jobNotificationMethod: '',
    customAvailabilityAlerts: '',
  });

  // Define all checkbox options
  const certifications = [
    { id: 'cprFirstAid', label: 'CPR & First Aid Certification' },
    { id: 'dementiaAlzheimers', label: 'Dementia & Alzheimer\'s Care Certification' },
    { id: 'nursingLicense', label: 'Nursing License (RN, LPN)' },
    { id: 'homeHealthAide', label: 'Home Health Aide Certification' },
    { id: 'gapp', label: 'Geriatric Adolescent Partnership Programme (GAPP) – Trinidad and Tobago' },
  ];

  const careServices = [
    { id: 'elderlyCare', label: '🧓 Elderly Care' },
    { id: 'specialNeedsChild', label: '👶 Special Needs Child Care' },
    { id: 'alzheimersDementia', label: '🧠 Alzheimer\'s / Dementia Care' },
    { id: 'overnightCare', label: '🌙 Overnight / 24-Hour Care' },
    { id: 'hospiceCare', label: '🏥 Hospice & Palliative Care' },
    { id: 'companionCare', label: '🤝 Companion Care' },
    { id: 'mealPreparation', label: '🍽️ Meal Preparation & Nutrition' },
    { id: 'mobilityAssistance', label: '♿ Mobility Assistance & Physical Therapy Support' },
    { id: 'medicationManagement', label: '💊 Medication Reminders & Administration' },
    { id: 'postSurgery', label: '🩹 Post-Surgery & Rehabilitation Support' },
    { id: 'housekeeping', label: '🏠 Housekeeping & Home Assistance' },
  ];

  const languages = [
    { id: 'english', label: 'English' },
    { id: 'spanish', label: 'Spanish' },
    { id: 'french', label: 'French' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'chinese', label: 'Chinese' },
  ];

  const availability = [
    { id: 'weekdays', label: 'Weekdays' },
    { id: 'weekends', label: 'Weekends' },
    { id: 'nights', label: 'Nights' },
    { id: 'oncall', label: '24/7 On-Call' },
  ];

  const paymentMethods = [
    { id: 'cash', label: 'Cash' },
    { id: 'bankTransfer', label: 'Bank Transfer' },
  ];

  const jobMatchingCriteria = [
    { id: 'locationBased', label: 'Location-Based Matching (Only show jobs in my selected work areas)' },
    { id: 'skillBased', label: 'Skill-Based Matching (Only show jobs that match my certifications & expertise)' },
    { id: 'availabilityBased', label: 'Availability-Based Matching (Only show jobs that fit my selected work schedule)' },
    { id: 'emergency', label: 'Emergency & Last-Minute Requests (Receive urgent job notifications)' },
  ];

  // State for checkboxes
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedCareServices, setSelectedCareServices] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedJobMatchingCriteria, setSelectedJobMatchingCriteria] = useState<string[]>([]);
  const [otherCertification, setOtherCertification] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    profilePicture: null,
    certificationProof: null,
    backgroundCheckProof: null,
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      toast.error('You must be logged in to complete registration');
      navigate('/auth');
      return;
    }

    // Check if the user already has a profile
    const fetchUserProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        // If profile exists and has full_name, pre-fill the form
        if (profile && profile.full_name) {
          setFormData({
            fullName: profile.full_name || '',
            phoneNumber: profile.phone_number || '',
            address: profile.address || '',
            professionalType: profile.professional_type || '',
            licenseNumber: profile.license_number || '',
            yearsOfExperience: profile.years_of_experience || '',
            workType: profile.work_type || '',
            bio: profile.bio || '',
            whyChooseCaregiving: profile.why_choose_caregiving || '',
            expectedRate: profile.expected_rate || '',
            preferredWorkLocations: profile.preferred_work_locations || '',
            commuteMode: profile.commute_mode || '',
            backgroundCheck: profile.background_check || false,
            legallyAuthorized: profile.legally_authorized || false,
            listInDirectory: profile.list_in_directory || false,
            enableJobAlerts: profile.enable_job_alerts || false,
            jobNotificationMethod: profile.job_notification_method || '',
            customAvailabilityAlerts: profile.custom_availability_alerts || '',
          });
          
          setSelectedCertifications(profile.certifications || []);
          setSelectedCareServices(profile.care_services || []);
          setSelectedLanguages(profile.languages || []);
          setSelectedAvailability(profile.availability || []);
          setSelectedPaymentMethods(profile.payment_methods || []);
          setSelectedJobMatchingCriteria(profile.job_matching_criteria || []);
          setOtherCertification(profile.other_certification || '');
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCertificationChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCertifications(prev => [...prev, id]);
    } else {
      setSelectedCertifications(prev => prev.filter(item => item !== id));
    }
  };

  const handleCareServiceChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCareServices(prev => [...prev, id]);
    } else {
      setSelectedCareServices(prev => prev.filter(item => item !== id));
    }
  };

  const handleLanguageChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLanguages(prev => [...prev, id]);
    } else {
      setSelectedLanguages(prev => prev.filter(item => item !== id));
    }
  };

  const handleAvailabilityChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAvailability(prev => [...prev, id]);
    } else {
      setSelectedAvailability(prev => prev.filter(item => item !== id));
    }
  };

  const handlePaymentMethodChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPaymentMethods(prev => [...prev, id]);
    } else {
      setSelectedPaymentMethods(prev => prev.filter(item => item !== id));
    }
  };

  const handleJobMatchingCriteriaChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedJobMatchingCriteria(prev => [...prev, id]);
    } else {
      setSelectedJobMatchingCriteria(prev => prev.filter(item => item !== id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles({
        ...uploadedFiles,
        [fileType]: e.target.files[0]
      });
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      if (!user) return null;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${path}/${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to complete registration');
      navigate('/auth');
      return;
    }
    
    // Validation for required fields
    if (
      !formData.fullName || 
      !formData.phoneNumber || 
      !formData.address || 
      !formData.professionalType || 
      selectedCareServices.length === 0 ||
      !formData.workType ||
      selectedAvailability.length === 0
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setFormSubmitted(true);
    
    try {
      console.log('Starting profile update with user ID:', user.id);
      
      // Upload files if provided
      let profilePictureUrl = null;
      let certificationProofUrl = null;
      let backgroundCheckProofUrl = null;
      
      if (uploadedFiles.profilePicture) {
        profilePictureUrl = await uploadFile(uploadedFiles.profilePicture, 'profile-pictures');
      }
      
      if (uploadedFiles.certificationProof) {
        certificationProofUrl = await uploadFile(uploadedFiles.certificationProof, 'certification-proofs');
      }
      
      if (uploadedFiles.backgroundCheckProof) {
        backgroundCheckProofUrl = await uploadFile(uploadedFiles.backgroundCheckProof, 'background-checks');
      }
      
      // Using upsert to either update an existing profile or create a new one
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          address: formData.address,
          avatar_url: profilePictureUrl || undefined,
          professional_type: formData.professionalType,
          license_number: formData.licenseNumber,
          certifications: selectedCertifications,
          other_certification: otherCertification,
          certification_proof_url: certificationProofUrl || undefined,
          care_services: selectedCareServices,
          languages: selectedLanguages,
          years_of_experience: formData.yearsOfExperience,
          work_type: formData.workType,
          availability: selectedAvailability,
          background_check: formData.backgroundCheck,
          background_check_proof_url: backgroundCheckProofUrl || undefined,
          legally_authorized: formData.legallyAuthorized,
          expected_rate: formData.expectedRate,
          payment_methods: selectedPaymentMethods,
          bio: formData.bio,
          why_choose_caregiving: formData.whyChooseCaregiving,
          preferred_work_locations: formData.preferredWorkLocations,
          commute_mode: formData.commuteMode,
          list_in_directory: formData.listInDirectory,
          enable_job_alerts: formData.enableJobAlerts,
          job_notification_method: formData.jobNotificationMethod,
          job_matching_criteria: selectedJobMatchingCriteria,
          custom_availability_alerts: formData.customAvailabilityAlerts,
          role: 'professional'
        }, { 
          onConflict: 'id'
        });
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      console.log('Profile updated successfully');
      
      // Show success message
      toast.success('Profile completed successfully!');
      
      // Wait a moment before redirect to ensure the database has updated
      setTimeout(() => {
        console.log('Redirecting to professional dashboard...');
        navigate('/dashboard/professional');
      }, 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      setFormSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // File input references for custom upload buttons
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const certificationProofRef = useRef<HTMLInputElement>(null);
  const backgroundCheckProofRef = useRef<HTMLInputElement>(null);

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Professional Profile</CardTitle>
          <CardDescription>
            Please provide detailed information to help us connect you with families seeking care services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal & Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Personal & Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleTextChange}
                    placeholder="Your full name"
                    required
                    disabled={isLoading || formSubmitted}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleTextChange}
                    placeholder="Your phone number"
                    type="tel"
                    required
                    disabled={isLoading || formSubmitted}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'profilePicture')}
                  ref={profilePictureRef}
                  disabled={isLoading || formSubmitted}
                />
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => profilePictureRef.current?.click()}
                    disabled={isLoading || formSubmitted}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  {uploadedFiles.profilePicture && (
                    <span className="text-sm text-green-600">
                      {uploadedFiles.profilePicture.name} selected
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleTextChange}
                  placeholder="Your address"
                  required
                  disabled={isLoading || formSubmitted}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredWorkLocations">Preferred Work Locations</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('preferredWorkLocations', value)}
                  value={formData.preferredWorkLocations}
                  disabled={isLoading || formSubmitted}
                >
                  <SelectTrigger id="preferredWorkLocations">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portOfSpain">Port of Spain</SelectItem>
                    <SelectItem value="sanFernando">San Fernando</SelectItem>
                    <SelectItem value="arima">Arima</SelectItem>
                    <SelectItem value="chaguanas">Chaguanas</SelectItem>
                    <SelectItem value="pointFortin">Point Fortin</SelectItem>
                    <SelectItem value="anyLocation">Any Location in Trinidad & Tobago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Commute Mode</Label>
                <RadioGroup 
                  value={formData.commuteMode} 
                  onValueChange={(value) => handleSelectChange('commuteMode', value)}
                  disabled={isLoading || formSubmitted}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ownVehicle" id="ownVehicle" />
                    <Label htmlFor="ownVehicle">Own Vehicle / Drive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="publicTransport" id="publicTransport" />
                    <Label htmlFor="publicTransport">Public Transport</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dropped" id="dropped" />
                    <Label htmlFor="dropped">Dropped to and from work</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Section 2: Professional Type & Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Professional Type & Credentials</h3>
              
              <div className="space-y-2">
                <Label>Are you registering as:</Label>
                <RadioGroup 
                  value={formData.professionalType} 
                  onValueChange={(value) => handleSelectChange('professionalType', value)}
                  disabled={isLoading || formSubmitted}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual Care Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agency" id="agency" />
                    <Label htmlFor="agency">Care Agency</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Professional License Number (if applicable)</Label>
                <Input 
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleTextChange}
                  placeholder="Enter license number"
                  disabled={isLoading || formSubmitted}
                />
              </div>

              <div className="space-y-2">
                <Label>Certifications & Training (Select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={cert.id} 
                        checked={selectedCertifications.includes(cert.id)}
                        onCheckedChange={(checked) => handleCertificationChange(cert.id, checked === true)}
                        disabled={isLoading || formSubmitted}
                      />
                      <Label htmlFor={cert.id} className="cursor-pointer">{cert.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherCertification">Other Certification</Label>
                <Input 
                  id="otherCertification"
                  value={otherCertification}
                  onChange={(e) => setOtherCertification(e.target.value)}
                  placeholder="Specify other certifications"
                  disabled={isLoading || formSubmitted}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificationProof">Upload Proof of Certifications</Label>
                <input
                  type="file"
                  id="certificationProof"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'certificationProof')}
                  ref={certificationProofRef}
                  disabled={isLoading || formSubmitted}
                />
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => certificationProofRef.current?.click()}
                    disabled={isLoading || formSubmitted}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  {uploadedFiles.certificationProof && (
                    <span className="text-sm text-green-600">
                      {uploadedFiles.certificationProof.name} selected
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('yearsOfExperience', value)}
                  value={formData.yearsOfExperience}
                  disabled={isLoading || formSubmitted}
                >
                  <SelectTrigger id="yearsOfExperience">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={lang.id} 
                        checked={selectedLanguages.includes(lang.id)}
                        onCheckedChange={(checked) => handleLanguageChange(lang.id, checked === true)}
                        disabled={isLoading || formSubmitted}
                      />
                      <Label htmlFor={lang.id} className="cursor-pointer">{lang.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Care Services You Offer (Select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {careServices.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={service.id} 
                        checked={selectedCareServices.includes(service.id)}
                        onCheckedChange={(checked) => handleCareServiceChange(service.id, checked === true)}
                        disabled={isLoading || formSubmitted}
                      />
                      <Label htmlFor={service.id} className="cursor-pointer">{service.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Work Availability & Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Work Availability & Preferences</h3>
              
              <div className="space-y-2">
                <Label>What type of work are you looking for?</Label>
                <RadioGroup 
                  value={formData.workType} 
                  onValueChange={(value) => handleSelectChange('workType', value)}
                  disabled={isLoading || formSubmitted}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fullTime" id="fullTime" />
                    <Label htmlFor="fullTime">Full-Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partTime" id="partTime" />
                    <Label htmlFor="partTime">Part-Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="liveIn" id="liveIn" />
                    <Label htmlFor="liveIn">Live-In</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly / On-Demand</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Availability (Select all that apply)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availability.map((avail) => (
                    <div key={avail.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={avail.id} 
                        checked={selectedAvailability.includes(avail.id)}
                        onCheckedChange={(checked) => handleAvailabilityChange(avail.id, checked === true)}
                        disabled={isLoading || formSubmitted}
                      />
                      <Label htmlFor={avail.id} className="cursor-pointer">{avail.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Background & Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Background & Security</h3>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="backgroundCheck"
                    checked={formData.backgroundCheck}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, backgroundCheck: checked === true }))}
                    disabled={isLoading || formSubmitted}
                  />
                  <Label htmlFor="backgroundCheck">Do you have a valid background check?</Label>
                </div>
                
                {formData.backgroundCheck && (
                  <div className="ml-6 mt-2">
                    <Label htmlFor="backgroundCheckProof">Upload Proof of Background Check</Label>
                    <input
                      type="file"
                      id="backgroundCheckProof"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'backgroundCheckProof')}
                      ref={backgroundCheckProofRef}
                      disabled={isLoading || formSubmitted}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => backgroundCheckProofRef.current?.click()}
                        disabled={isLoading || formSubmitted}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      {uploadedFiles.backgroundCheckProof && (
                        <span className="text-sm text-green-600">
                          {uploadedFiles.backgroundCheckProof.name} selected
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="legallyAuthorized"
                  checked={formData.legallyAuthorized}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, legallyAuthorized: checked === true }))}
                  disabled={isLoading || formSubmitted}
                />
                <Label htmlFor="legallyAuthorized">I am legally authorized to work</Label>
              </div>
            </div>

            {/* Section 5: Payment & Compensation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Payment & Compensation</h3>
              
              <div className="space-y-2">
                <Label htmlFor="expectedRate">Expected Hourly Rate ($ per hour)</Label>
                <Input 
                  id="expectedRate"
                  name="expectedRate"
                  value={formData.expectedRate}
                  onChange={handleTextChange}
                  placeholder="Enter rate (e.g., 15)"
                  type="number"
                  min="0"
                  disabled={isLoading || formSubmitted}
                />
              </div>

              <div className="space-y-2">
                <Label>Accepted Payment Methods</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={method.id} 
                        checked={selectedPaymentMethods.includes(method.id)}
                        onCheckedChange={(checked) => handlePaymentMethodChange(method.id, checked === true)}
                        disabled={isLoading || formSubmitted}
                      />
                      <Label htmlFor={method.id} className="cursor-pointer">{method.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 6: Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="bio">About You</Label>
                <Textarea 
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleTextChange}
                  placeholder="Tell us about yourself and your caregiving philosophy"
                  disabled={isLoading || formSubmitted}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyChooseCaregiving">Why did you choose caregiving?</Label>
                <Textarea 
                  id="whyChooseCaregiving"
                  name="whyChooseCaregiving"
                  value={formData.whyChooseCaregiving}
                  onChange={handleTextChange}
                  placeholder="Share your story and motivation"
                  disabled={isLoading || formSubmitted}
                />
              </div>
            </div>

            {/* Section 7: Job Alerts & Matching Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🔹 Job Alerts & Matching Preferences</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enableJobAlerts"
                  checked={formData.enableJobAlerts}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableJobAlerts: checked === true }))}
                  disabled={isLoading || formSubmitted}
                />
                <Label htmlFor="enableJobAlerts">Enable Job Alerts</Label>
              </div>

              {formData.enableJobAlerts && (
                <>
                  <div className="space-y-2 ml-6">
                    <Label>Preferred Job Notification Method</Label>
                    <RadioGroup 
                      value={formData.jobNotificationMethod} 
                      onValueChange={(value) => handleSelectChange('jobNotificationMethod', value)}
                      disabled={isLoading || formSubmitted}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <Label htmlFor="sms">SMS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2 ml-6">
                    <Label>Preferred Job Matching Criteria</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {jobMatchingCriteria.map((criteria) => (
                        <div key={criteria.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={criteria.id} 
                            checked={selectedJobMatchingCriteria.includes(criteria.id)}
                            onCheckedChange={(checked) => handleJobMatchingCriteriaChange(criteria.id, checked === true)}
                            disabled={isLoading || formSubmitted}
                          />
                          <Label htmlFor={criteria.id} className="cursor-pointer">{criteria.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 ml-6">
                    <Label>Custom Availability Alerts</Label>
                    <RadioGroup 
                      value={formData.customAvailabilityAlerts} 
                      onValueChange={(value) => handleSelectChange('customAvailabilityAlerts', value)}
                      disabled={isLoading || formSubmitted}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Notify me daily about new job requests</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly">Notify me weekly about job opportunities</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="perfectMatch" id="perfectMatch" />
                        <Label htmlFor="perfectMatch">Notify me only when a job perfectly matches my profile</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="listInDirectory"
                  checked={formData.listInDirectory}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, listInDirectory: checked === true }))}
                  disabled={isLoading || formSubmitted}
                />
                <Label htmlFor="listInDirectory">List me in the Caregiver Directory (families can find your profile)</Label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || formSubmitted}
            >
              {isLoading || formSubmitted ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
