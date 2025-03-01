import React, { useState, useEffect } from 'react';
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

const ProfessionalRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [professionalType, setProfessionalType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [otherCertification, setOtherCertification] = useState('');
  const [certificationProofUrl, setCertificationProofUrl] = useState('');
  const [careServices, setCareServices] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [workType, setWorkType] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [backgroundCheck, setBackgroundCheck] = useState(false);
  const [backgroundCheckProofUrl, setBackgroundCheckProofUrl] = useState('');
  const [legallyAuthorized, setLegallyAuthorized] = useState(false);
  const [expectedRate, setExpectedRate] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [whyChooseCaregiving, setWhyChooseCaregiving] = useState('');
  const [preferredWorkLocations, setPreferredWorkLocations] = useState('');
  const [commuteMode, setCommuteMode] = useState('');
  const [listInDirectory, setListInDirectory] = useState(false);
  const [enableJobAlerts, setEnableJobAlerts] = useState(false);
  const [jobNotificationMethod, setJobNotificationMethod] = useState('');
  const [jobMatchingCriteria, setJobMatchingCriteria] = useState<string[]>([]);
  const [customAvailabilityAlerts, setCustomAvailabilityAlerts] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        // Check if profile already exists and pre-fill form
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          setAvatarUrl(profileData.avatar_url);
          setFirstName(profileData.full_name?.split(' ')[0] || '');
          setLastName(profileData.full_name?.split(' ')[1] || '');
          setProfessionalType(profileData.professional_type || '');
          setLicenseNumber(profileData.license_number || '');
          setCertifications(profileData.certifications || []);
          setOtherCertification(profileData.other_certification || '');
          setCertificationProofUrl(profileData.certification_proof_url || '');
          setCareServices(profileData.care_services || []);
          setLanguages(profileData.languages || []);
          setYearsOfExperience(profileData.years_of_experience || '');
          setWorkType(profileData.work_type || '');
          setAvailability(profileData.availability || []);
          setBackgroundCheck(profileData.background_check || false);
          setBackgroundCheckProofUrl(profileData.background_check_proof_url || '');
          setLegallyAuthorized(profileData.legally_authorized || false);
          setExpectedRate(profileData.expected_rate || '');
          setPaymentMethods(profileData.payment_methods || []);
          setBio(profileData.bio || '');
          setWhyChooseCaregiving(profileData.why_choose_caregiving || '');
          setPreferredWorkLocations(profileData.preferred_work_locations || '');
          setCommuteMode(profileData.commute_mode || '');
          setListInDirectory(profileData.list_in_directory || false);
          setEnableJobAlerts(profileData.enable_job_alerts || false);
          setJobNotificationMethod(profileData.job_notification_method || '');
          setJobMatchingCriteria(profileData.job_matching_criteria || []);
          setCustomAvailabilityAlerts(profileData.custom_availability_alerts || '');
        }
      } else {
        // If not logged in, redirect to auth page
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
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('No user found');
      }

      // Upload avatar if selected
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

      // Update profile
      const fullName = `${firstName} ${lastName}`.trim();
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        professional_type: professionalType,
        license_number: licenseNumber,
        certifications: certifications,
        other_certification: otherCertification,
        certification_proof_url: certificationProofUrl,
        care_services: careServices,
        languages: languages,
        years_of_experience: yearsOfExperience,
        work_type: workType,
        availability: availability,
        background_check: backgroundCheck,
        background_check_proof_url: backgroundCheckProofUrl,
        legally_authorized: legallyAuthorized,
        expected_rate: expectedRate,
        payment_methods: paymentMethods,
        bio: bio,
        why_choose_caregiving: whyChooseCaregiving,
        preferred_work_locations: preferredWorkLocations,
        commute_mode: commuteMode,
        list_in_directory: listInDirectory,
        enable_job_alerts: enableJobAlerts,
        job_notification_method: jobNotificationMethod,
        job_matching_criteria: jobMatchingCriteria,
        custom_availability_alerts: customAvailabilityAlerts,
        role: 'professional' as const,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Registration Complete',
        description: 'Your professional profile has been updated.'
      });

      // Redirect to professional dashboard
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

  // Helper for checkbox arrays
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
      <h1 className="text-3xl font-bold mb-6">Professional Registration</h1>
      <p className="text-gray-500 mb-8">
        Complete your professional profile to connect with families in need of care services.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal & Contact Information</CardTitle>
            <CardDescription>
              Tell us about yourself so families can learn more about you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add avatar upload section */}
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
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
              <p className="text-sm text-gray-500">Email address from your registration</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalType">Type of Professional *</Label>
              <Input 
                id="professionalType" 
                placeholder="e.g., Nurse, Therapist" 
                value={professionalType} 
                onChange={(e) => setProfessionalType(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
              <Input 
                id="licenseNumber" 
                placeholder="License Number" 
                value={licenseNumber} 
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Certifications & Services</CardTitle>
            <CardDescription>
              Showcase your qualifications and the services you offer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Certifications (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'cert-cna', label: 'Certified Nursing Assistant (CNA)', value: 'CNA' },
                  { id: 'cert-lpn', label: 'Licensed Practical Nurse (LPN)', value: 'LPN' },
                  { id: 'cert-rn', label: 'Registered Nurse (RN)', value: 'RN' },
                  { id: 'cert-cpr', label: 'CPR/First Aid', value: 'CPR/First Aid' },
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
              <Label htmlFor="otherCertification">Other Certification (Optional)</Label>
              <Input 
                id="otherCertification" 
                placeholder="Enter other certification" 
                value={otherCertification} 
                onChange={(e) => setOtherCertification(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificationProofUrl">Certification Proof URL (Optional)</Label>
              <Input 
                id="certificationProofUrl" 
                placeholder="https://" 
                value={certificationProofUrl} 
                onChange={(e) => setCertificationProofUrl(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Care Services Offered (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'service-elderly', label: 'Elderly Care', value: 'Elderly Care' },
                  { id: 'service-special', label: 'Special Needs Care', value: 'Special Needs Care' },
                  { id: 'service-dementia', label: 'Dementia Care', value: 'Dementia Care' },
                  { id: 'service-home', label: 'Home Health Assistance', value: 'Home Health Assistance' },
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
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Languages Spoken (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'lang-en', label: 'English', value: 'English' },
                  { id: 'lang-es', label: 'Spanish', value: 'Spanish' },
                  { id: 'lang-fr', label: 'French', value: 'French' },
                  { id: 'lang-de', label: 'German', value: 'German' },
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
            <CardTitle>Experience & Availability</CardTitle>
            <CardDescription>
              Share your experience and when you're available to work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
              <Input 
                id="yearsOfExperience" 
                type="number" 
                placeholder="Years of Experience" 
                value={yearsOfExperience} 
                onChange={(e) => setYearsOfExperience(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Work Type *</Label>
              <Select value={workType} onValueChange={setWorkType}>
                <SelectTrigger id="workType">
                  <SelectValue placeholder="Select Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Availability (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'avail-morning', label: 'Morning', value: 'Morning' },
                  { id: 'avail-afternoon', label: 'Afternoon', value: 'Afternoon' },
                  { id: 'avail-evening', label: 'Evening', value: 'Evening' },
                  { id: 'avail-overnight', label: 'Overnight', value: 'Overnight' },
                  { id: 'avail-weekends', label: 'Weekends', value: 'Weekends' },
                  { id: 'avail-holidays', label: 'Holidays', value: 'Holidays' },
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
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Background & Legal</CardTitle>
            <CardDescription>
              Confirm your background check status and legal authorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="backgroundCheck" 
                checked={backgroundCheck}
                onCheckedChange={setBackgroundCheck}
              />
              <Label htmlFor="backgroundCheck" className="font-normal">
                I have completed a background check
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundCheckProofUrl">Background Check Proof URL (Optional)</Label>
              <Input 
                id="backgroundCheckProofUrl" 
                placeholder="https://" 
                value={backgroundCheckProofUrl} 
                onChange={(e) => setBackgroundCheckProofUrl(e.target.value)}
              />
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
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Financial Preferences</CardTitle>
            <CardDescription>
              Specify your rate and preferred payment methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expectedRate">Expected Rate *</Label>
              <Input 
                id="expectedRate" 
                placeholder="e.g., $20/hour" 
                value={expectedRate} 
                onChange={(e) => setExpectedRate(e.target.value)}
                required 
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Preferred Payment Methods (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'payment-cash', label: 'Cash', value: 'Cash' },
                  { id: 'payment-check', label: 'Check', value: 'Check' },
                  { id: 'payment-paypal', label: 'PayPal', value: 'PayPal' },
                  { id: 'payment-venmo', label: 'Venmo', value: 'Venmo' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={paymentMethods.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        paymentMethods, 
                        setPaymentMethods
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
            <CardTitle>About You</CardTitle>
            <CardDescription>
              Share your bio and why you chose caregiving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Write a short bio about yourself" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyChooseCaregiving">Why did you choose caregiving?</Label>
              <Textarea 
                id="whyChooseCaregiving" 
                placeholder="Share your motivation for caregiving" 
                value={whyChooseCaregiving} 
                onChange={(e) => setWhyChooseCaregiving(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preferences & Notifications</CardTitle>
            <CardDescription>
              Set your work preferences and notification settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preferredWorkLocations">Preferred Work Locations</Label>
              <Input 
                id="preferredWorkLocations" 
                placeholder="e.g., Home, Assisted Living" 
                value={preferredWorkLocations} 
                onChange={(e) => setPreferredWorkLocations(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commuteMode">Preferred Commute Mode</Label>
              <Input 
                id="commuteMode" 
                placeholder="e.g., Car, Public Transport" 
                value={commuteMode} 
                onChange={(e) => setCommuteMode(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Switch 
                id="listInDirectory" 
                checked={listInDirectory}
                onCheckedChange={setListInDirectory}
              />
              <Label htmlFor="listInDirectory" className="font-normal">
                List in Directory
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="enableJobAlerts" 
                checked={enableJobAlerts}
                onCheckedChange={setEnableJobAlerts}
              />
              <Label htmlFor="enableJobAlerts" className="font-normal">
                Enable Job Alerts
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobNotificationMethod">Job Notification Method</Label>
              <Select value={jobNotificationMethod} onValueChange={setJobNotificationMethod}>
                <SelectTrigger id="jobNotificationMethod">
                  <SelectValue placeholder="Select Notification Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="jobMatchingCriteria">Job Matching Criteria</Label>
              <Input 
                id="jobMatchingCriteria" 
                placeholder="e.g., Location, Skills" 
                value={jobMatchingCriteria} 
                onChange={(e) => setJobMatchingCriteria(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customAvailabilityAlerts">Custom Availability Alerts</Label>
              <Input 
                id="customAvailabilityAlerts" 
                placeholder="e.g., Weekday Mornings Only" 
                value={customAvailabilityAlerts} 
                onChange={(e) => setCustomAvailabilityAlerts(e.target.value)}
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
