
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { 
  User, Stethoscope, Home, Brain, Activity, 
  Pill, Heart, Clock, Calendar, Briefcase, 
  DollarSign, FileCheck, Users, MapPin, Phone,
  Mail, Check, X, UserCheck, Upload
} from 'lucide-react';

const ProfessionalRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [professionalRole, setProfessionalRole] = useState('');
  const [otherRole, setOtherRole] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [otherCertification, setOtherCertification] = useState('');
  const [certificationProofUrl, setCertificationProofUrl] = useState('');
  // New state for certification document file
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  
  const [careServices, setCareServices] = useState<string[]>([]);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [otherMedicalCondition, setOtherMedicalCondition] = useState('');
  
  const [availability, setAvailability] = useState<string[]>([]);
  const [workType, setWorkType] = useState('');
  const [preferredFamilyMatching, setPreferredFamilyMatching] = useState<string[]>([]);
  
  // Changed from backgroundCheck to certificateOfCharacter
  const [certificateOfCharacter, setCertificateOfCharacter] = useState(false);
  const [backgroundCheckProofUrl, setBackgroundCheckProofUrl] = useState('');
  // New state for background check document file
  const [backgroundCheckFile, setBackgroundCheckFile] = useState<File | null>(null);
  const [comfortWithTasks, setComfortWithTasks] = useState<string[]>([]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [liabilityInsurance, setLiabilityInsurance] = useState(false);
  const [expectedRate, setExpectedRate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [legallyAuthorized, setLegallyAuthorized] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Refs for file inputs
  const certificationFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundCheckFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          setAvatarUrl(profileData.avatar_url);
          setFirstName(profileData.full_name?.split(' ')[0] || '');
          setLastName(profileData.full_name?.split(' ')[1] || '');
          setProfessionalRole(profileData.professional_type || '');
          setOtherRole(profileData.other_certification || '');
          setYearsOfExperience(profileData.years_of_experience || '');
          setLicenseNumber(profileData.license_number || '');
          setCertifications(profileData.certifications || []);
          setOtherCertification(profileData.other_certification || '');
          setCertificationProofUrl(profileData.certification_proof_url || '');
          setLocation(profileData.location || '');
          setPhoneNumber(profileData.phone_number || '');
          setPreferredContactMethod(profileData.preferred_contact_method || '');
          setCareServices(profileData.care_services || []);
          setMedicalConditions(profileData.medical_conditions || []);
          setOtherMedicalCondition(profileData.other_medical_condition || '');
          setAvailability(profileData.availability || []);
          setWorkType(profileData.work_type || '');
          setPreferredFamilyMatching(profileData.preferred_family_matching || []);
          setCertificateOfCharacter(profileData.certificate_of_character || false);
          setBackgroundCheckProofUrl(profileData.background_check_proof_url || '');
          setComfortWithTasks(profileData.comfort_with_tasks || []);
          setEmergencyContactName(profileData.emergency_contact_name || '');
          setEmergencyContactPhone(profileData.emergency_contact_phone || '');
          setLiabilityInsurance(profileData.liability_insurance || false);
          setExpectedRate(profileData.expected_rate || '');
          setAdditionalNotes(profileData.additional_notes || '');
          setLegallyAuthorized(profileData.legally_authorized || false);
          setLanguages(profileData.languages || []);
        }
      } else {
        navigate('/auth');
      }
    };

    getUser();
  }, [navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCertificationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setCertificationFile(file);
    
    toast({
      title: "File selected",
      description: `${file.name} will be uploaded when you submit the form.`
    });
  };

  const handleBackgroundCheckFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setBackgroundCheckFile(file);
    
    toast({
      title: "File selected",
      description: `${file.name} will be uploaded when you submit the form.`
    });
  };

  const uploadFileToStorage = async (file: File, folder: string) => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${folder}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('No user found');
      }

      let uploadedAvatarUrl = avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        uploadedAvatarUrl = data.publicUrl;
      }

      // Upload certification file if provided
      let certificationDocUrl = certificationProofUrl;
      if (certificationFile) {
        certificationDocUrl = await uploadFileToStorage(certificationFile, 'certifications');
      }

      // Upload background check file if provided
      let backgroundCheckDocUrl = backgroundCheckProofUrl;
      if (backgroundCheckFile) {
        backgroundCheckDocUrl = await uploadFileToStorage(backgroundCheckFile, 'background_checks');
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const finalProfessionalRole = professionalRole === 'Other' ? otherRole : professionalRole;
      
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        professional_type: finalProfessionalRole,
        years_of_experience: yearsOfExperience,
        license_number: licenseNumber,
        certifications: certifications,
        other_certification: otherCertification,
        certification_proof_url: certificationDocUrl,
        location: location,
        phone_number: phoneNumber,
        preferred_contact_method: preferredContactMethod,
        care_services: careServices,
        medical_conditions: medicalConditions,
        other_medical_condition: otherMedicalCondition,
        availability: availability,
        work_type: workType,
        preferred_family_matching: preferredFamilyMatching,
        certificate_of_character: certificateOfCharacter,
        background_check_proof_url: backgroundCheckDocUrl,
        comfort_with_tasks: comfortWithTasks,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        liability_insurance: liabilityInsurance,
        expected_rate: expectedRate,
        additional_notes: additionalNotes,
        legally_authorized: legallyAuthorized,
        languages: languages,
        role: 'professional' as const,
        updated_at: new Date().toISOString(),
      };

      // Fix: Remove the unsupported 'returning' option
      const { error } = await supabase.from('profiles').upsert(updates, { 
        onConflict: 'id' 
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Registration Complete',
        description: 'Your professional profile has been updated.'
      });

      navigate('/dashboards/professional');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxArrayChange = (
    value: string, 
    currentArray: string[], 
    setFunction: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentArray.includes(value)) {
      setFunction(currentArray.filter(item => item !== value));
    } else {
      setFunction([...currentArray, value]);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Healthcare Professional Registration</h1>
      <p className="text-gray-500 mb-8">
        Complete your profile to connect with families in need of care services.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Personal & Contact Information
            </CardTitle>
            <CardDescription>
              Tell us about yourself so families can learn more about you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" />
                ) : (
                  <AvatarFallback>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <Label htmlFor="avatar" className="cursor-pointer text-primary">
                {avatarUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="First Name" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Last Name" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalRole">Professional Role *</Label>
              <Select value={professionalRole} onValueChange={setProfessionalRole} required>
                <SelectTrigger id="professionalRole">
                  <SelectValue placeholder="Select your professional role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional Agency">🏢 Professional Agency</SelectItem>
                  <SelectItem value="Licensed Nurse">🏥 Licensed Nurse (LPN/RN/BSN)</SelectItem>
                  <SelectItem value="Home Health Aide">🏠 Home Health Aide (HHA)</SelectItem>
                  <SelectItem value="Certified Nursing Assistant">👩‍⚕️ Certified Nursing Assistant (CNA)</SelectItem>
                  <SelectItem value="Special Needs Caregiver">🧠 Special Needs Caregiver</SelectItem>
                  <SelectItem value="Physical/Occupational Therapist">🏋️ Physical / Occupational Therapist</SelectItem>
                  <SelectItem value="Nutritional & Dietary Specialist">🍽️ Nutritional & Dietary Specialist</SelectItem>
                  <SelectItem value="Medication Management Expert">💊 Medication Management Expert</SelectItem>
                  <SelectItem value="Elderly & Mobility Support">👨‍🦽 Elderly & Mobility Support</SelectItem>
                  <SelectItem value="Holistic Care & Wellness">🌱 Holistic Care & Wellness</SelectItem>
                  <SelectItem value="GAPP">👨‍👦 The Geriatric Adolescent Partnership Programme (GAPP)</SelectItem>
                  <SelectItem value="Other">⚕️ Other (please specify)</SelectItem>
                </SelectContent>
              </Select>
              
              {professionalRole === 'Other' && (
                <div className="mt-2">
                  <Input 
                    placeholder="Please specify your professional role" 
                    value={otherRole} 
                    onChange={(e) => setOtherRole(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
              <Select value={yearsOfExperience} onValueChange={setYearsOfExperience} required>
                <SelectTrigger id="yearsOfExperience">
                  <SelectValue placeholder="Select your years of experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="2-5">2-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Input 
                    id="location" 
                    placeholder="City, State, Country" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <Input 
                    id="phoneNumber" 
                    placeholder="Phone Number" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <p className="text-sm text-gray-500">Email address from your registration</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact Method *</Label>
              <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod} required>
                <SelectTrigger id="preferredContactMethod">
                  <SelectValue placeholder="Select preferred contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="App Messaging">App Messaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" /> Certifications & Qualifications
            </CardTitle>
            <CardDescription>
              Share your professional credentials and qualifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
              <Input 
                id="licenseNumber" 
                placeholder="License Number" 
                value={licenseNumber} 
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label>Certifications (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'cert-cpr', label: 'CPR / First Aid', value: 'CPR/First Aid' },
                  { id: 'cert-cna', label: 'Certified Nursing Assistant (CNA)', value: 'CNA' },
                  { id: 'cert-hha', label: 'Home Health Aide (HHA)', value: 'HHA' },
                  { id: 'cert-lpn', label: 'Licensed Practical Nurse (LPN)', value: 'LPN' },
                  { id: 'cert-rn', label: 'Registered Nurse (RN)', value: 'RN' },
                  { id: 'cert-pt', label: 'Physical Therapist', value: 'Physical Therapist' },
                  { id: 'cert-ot', label: 'Occupational Therapist', value: 'Occupational Therapist' },
                  { id: 'cert-specialneeds', label: 'Special Needs Certification', value: 'Special Needs Certification' },
                  { id: 'cert-gapp', label: 'The Geriatric Adolescent Partnership Programme (GAPP)', value: 'GAPP' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={certifications.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        certifications, 
                        setCertifications
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherCertification">Other Certification</Label>
              <Input 
                id="otherCertification" 
                placeholder="Enter other certification" 
                value={otherCertification} 
                onChange={(e) => setOtherCertification(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificationFile">Certification Document (PDF or JPG)</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => certificationFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Certification
                </Button>
                {certificationFile && (
                  <span className="text-sm text-green-600">{certificationFile.name}</span>
                )}
              </div>
              <Input 
                id="certificationFile" 
                type="file" 
                accept=".pdf,.jpg,.jpeg" 
                onChange={handleCertificationFileChange} 
                className="hidden"
                ref={certificationFileInputRef}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload your certification documents in PDF or JPG format.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'lang-en', label: 'English', value: 'English' },
                  { id: 'lang-es', label: 'Spanish', value: 'Spanish' },
                  { id: 'lang-fr', label: 'French', value: 'French' },
                  { id: 'lang-zh', label: 'Chinese', value: 'Chinese' },
                  { id: 'lang-tl', label: 'Tagalog', value: 'Tagalog' },
                  { id: 'lang-vi', label: 'Vietnamese', value: 'Vietnamese' },
                  { id: 'lang-ko', label: 'Korean', value: 'Korean' },
                  { id: 'lang-ru', label: 'Russian', value: 'Russian' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={languages.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        languages, 
                        setLanguages
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" /> Care Services & Specializations
            </CardTitle>
            <CardDescription>
              Tell us what type of care services you provide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>What type of care do you provide? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'service-inhome', icon: <Home className="h-4 w-4" />, label: 'In-Home Care (Daily, Nighttime, Weekend, Live-in)', value: 'In-Home Care' },
                  { id: 'service-medical', icon: <Activity className="h-4 w-4" />, label: 'Medical Support (Post-surgery, Chronic Condition Management, Hospice)', value: 'Medical Support' },
                  { id: 'service-childspecial', icon: <Users className="h-4 w-4" />, label: 'Child or Special Needs Support (Autism, ADHD, Learning Disabilities)', value: 'Child/Special Needs Support' },
                  { id: 'service-cognitive', icon: <Brain className="h-4 w-4" />, label: 'Cognitive & Memory Care (Alzheimer\'s, Dementia, Parkinson\'s)', value: 'Cognitive & Memory Care' },
                  { id: 'service-mobility', icon: <Users className="h-4 w-4" />, label: 'Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)', value: 'Mobility Assistance' },
                  { id: 'service-medication', icon: <Pill className="h-4 w-4" />, label: 'Medication Management (Administering Medication, Insulin, Medical Equipment)', value: 'Medication Management' },
                  { id: 'service-nutrition', icon: <Users className="h-4 w-4" />, label: 'Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)', value: 'Nutritional Assistance' },
                  { id: 'service-household', icon: <Home className="h-4 w-4" />, label: 'Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)', value: 'Household Assistance' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={careServices.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        careServices, 
                        setCareServices
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>What medical conditions have you worked with? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'condition-alzheimers', label: 'Alzheimer\'s / Dementia / Cognitive Decline', value: 'Alzheimer\'s/Dementia' },
                  { id: 'condition-cancer', label: 'Cancer Patients (Palliative/Hospice Care)', value: 'Cancer' },
                  { id: 'condition-parkinsons', label: 'Parkinson\'s / Stroke Recovery / Paralysis', value: 'Parkinson\'s/Stroke' },
                  { id: 'condition-specialneeds', label: 'Special Needs (Autism, ADHD, Cerebral Palsy, etc.)', value: 'Special Needs' },
                  { id: 'condition-chronic', label: 'Chronic Illnesses (Diabetes, Heart Disease, Kidney Disease, etc.)', value: 'Chronic Illness' },
                  { id: 'condition-postsurgical', label: 'Post-Surgical Rehabilitation', value: 'Post-Surgical' },
                  { id: 'condition-bedridden', label: 'Bedridden Patients (Full-time care, Hygiene Assistance, etc.)', value: 'Bedridden' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={medicalConditions.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        medicalConditions, 
                        setMedicalConditions
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherMedicalCondition">Other Medical Conditions</Label>
              <Textarea 
                id="otherMedicalCondition" 
                placeholder="Specify any other medical conditions you've worked with" 
                value={otherMedicalCondition} 
                onChange={(e) => setOtherMedicalCondition(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Availability & Matching Preferences
            </CardTitle>
            <CardDescription>
              Let families know when you're available and your preferences for care.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Preferred Work Hours (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'avail-daytime', label: 'Daytime (8 AM - 5 PM)', value: 'Daytime' },
                  { id: 'avail-nightshift', label: 'Night Shifts (5 PM - 8 AM)', value: 'Night Shifts' },
                  { id: 'avail-weekends', label: 'Weekends Only', value: 'Weekends' },
                  { id: 'avail-livein', label: 'Live-In Care (Full-time in-home support)', value: 'Live-In' },
                  { id: 'avail-flexible', label: 'Flexible / On-Demand Availability', value: 'Flexible' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={availability.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        availability, 
                        setAvailability
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Do you work with:</Label>
              <RadioGroup value={workType} onValueChange={setWorkType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Care Agencies" id="work-agencies" />
                  <Label htmlFor="work-agencies" className="font-normal">🏥 Care Agencies</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Private Independent Care" id="work-independent" />
                  <Label htmlFor="work-independent" className="font-normal">👩‍⚕️ Private Independent Care (Freelance)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="work-both" />
                  <Label htmlFor="work-both" className="font-normal">🔀 Both (Agency & Independent Work Available)</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Preferred Family Matching (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'matching-elderly', label: 'Elderly Care Only', value: 'Elderly Care' },
                  { id: 'matching-children', label: 'Children / Special Needs Care Only', value: 'Children/Special Needs' },
                  { id: 'matching-medical', label: 'Medical & Rehabilitation Patients', value: 'Medical Rehabilitation' },
                  { id: 'matching-mobility', label: 'Mobility & Hospice Care', value: 'Mobility/Hospice' },
                  { id: 'matching-all', label: 'Open to All Matches', value: 'All Matches' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={preferredFamilyMatching.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        preferredFamilyMatching, 
                        setPreferredFamilyMatching
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Additional Details & Compliance
            </CardTitle>
            <CardDescription>
              Provide "Certificate of Character" or proof of request of "Certificate of Character".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="certificateOfCharacter" 
                checked={certificateOfCharacter}
                onCheckedChange={setCertificateOfCharacter}
              />
              <Label htmlFor="certificateOfCharacter" className="font-normal">
                I have received or requested a "Certificate of Character"
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundCheckFile">Certificate of Character Document (PDF or JPG)</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => backgroundCheckFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Certificate
                </Button>
                {backgroundCheckFile && (
                  <span className="text-sm text-green-600">{backgroundCheckFile.name}</span>
                )}
              </div>
              <Input 
                id="backgroundCheckFile" 
                type="file" 
                accept=".pdf,.jpg,.jpeg" 
                onChange={handleBackgroundCheckFileChange} 
                className="hidden"
                ref={backgroundCheckFileInputRef}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload your Certificate of Character in PDF or JPG format.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Are you comfortable with: (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'comfort-medication', label: 'Administering Medication', value: 'Medication' },
                  { id: 'comfort-housekeeping', label: 'Housekeeping / Meal Preparation', value: 'Housekeeping' },
                  { id: 'comfort-transportation', label: 'Transportation for Appointments', value: 'Transportation' },
                  { id: 'comfort-equipment', label: 'Handling Medical Equipment', value: 'Medical Equipment' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={comfortWithTasks.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        comfortWithTasks, 
                        setComfortWithTasks
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Emergency Contact Information (For caregiver safety)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="Emergency Contact Name" 
                  value={emergencyContactName} 
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
                <Input 
                  placeholder="Emergency Contact Phone" 
                  value={emergencyContactPhone} 
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="liabilityInsurance" 
                checked={liabilityInsurance}
                onCheckedChange={setLiabilityInsurance}
              />
              <Label htmlFor="liabilityInsurance" className="font-normal">
                I have liability insurance (For independent caregivers)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="legallyAuthorized" 
                checked={legallyAuthorized}
                onCheckedChange={setLegallyAuthorized}
              />
              <Label htmlFor="legallyAuthorized" className="font-normal">
                I am legally authorized to work in this country
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedRate" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Hourly Rate / Salary Expectations
              </Label>
              <Input 
                id="expectedRate" 
                placeholder="e.g., $20/hour or $4000/month" 
                value={expectedRate} 
                onChange={(e) => setExpectedRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes for Families</Label>
              <Textarea 
                id="additionalNotes" 
                placeholder="Share any additional information that might be helpful for families" 
                value={additionalNotes} 
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalRegistration;
