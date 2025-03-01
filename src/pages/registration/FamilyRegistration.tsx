
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

const FamilyRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [careRecipientName, setCareRecipientName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [careTypes, setCareTypes] = useState<string[]>([]);
  
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [otherSpecialNeeds, setOtherSpecialNeeds] = useState('');
  const [specializedCare, setSpecializedCare] = useState<string[]>([]);
  
  const [caregiverType, setCaregiverType] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [careSchedule, setCareSchedule] = useState('');
  const [caregiverPreferences, setCaregiverPreferences] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [budgetPreferences, setBudgetPreferences] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          setEmail(data.user.email || '');
          
          // Fetch existing profile data
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            // Don't show an error toast here as this might be a new user
            return;
          }

          if (profileData) {
            setAvatarUrl(profileData.avatar_url);
            setFirstName(profileData.full_name?.split(' ')[0] || '');
            setLastName(profileData.full_name?.split(' ')[1] || '');
            setPhoneNumber(profileData.phone_number || '');
            setAddress(profileData.address || '');
            setCareRecipientName(profileData.care_recipient_name || '');
            setRelationship(profileData.relationship || '');
            setCareTypes(profileData.care_types || []);
            setSpecialNeeds(profileData.special_needs || []);
            setSpecializedCare(profileData.specialized_care || []);
            setOtherSpecialNeeds(profileData.other_special_needs || '');
            setCaregiverType(profileData.caregiver_type || '');
            setPreferredContactMethod(profileData.preferred_contact_method || '');
            setCareSchedule(profileData.care_schedule || '');
            setBudgetPreferences(profileData.budget_preferences || '');
            setCaregiverPreferences(profileData.caregiver_preferences || '');
            setEmergencyContact(profileData.emergency_contact || '');
            setAdditionalNotes(profileData.additional_notes || '');
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Error getting user:', err);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please sign in again to continue.'
        });
        navigate('/auth');
      }
    };

    getUser();
  }, [navigate, toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('No user found. Please sign in again.');
      }

      // Validate required fields
      if (!firstName || !lastName || !phoneNumber || !address || !careRecipientName || !relationship) {
        throw new Error('Please fill in all required fields');
      }

      // Create a session variable to use for authorization
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Session error:", sessionError);
        throw new Error('Authentication session expired. Please sign in again.');
      }
      
      // Upload avatar if selected
      let uploadedAvatarUrl = avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // We'll use the session token for authentication
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            contentType: avatarFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          throw new Error('Failed to upload profile picture. Please try again.');
        }

        if (data) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
          uploadedAvatarUrl = urlData.publicUrl;
        }
      }

      // Make sure arrays are initialized properly
      const processedCareTypes = careTypes || [];
      const processedSpecialNeeds = specialNeeds || [];
      const processedSpecializedCare = specializedCare || [];

      const fullName = `${firstName} ${lastName}`.trim();
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        phone_number: phoneNumber,
        address: address,
        role: 'family' as const,
        updated_at: new Date().toISOString(),
        care_recipient_name: careRecipientName,
        relationship: relationship,
        care_types: processedCareTypes,
        special_needs: processedSpecialNeeds,
        specialized_care: processedSpecializedCare,
        other_special_needs: otherSpecialNeeds,
        caregiver_type: caregiverType,
        preferred_contact_method: preferredContactMethod,
        care_schedule: careSchedule,
        budget_preferences: budgetPreferences,
        caregiver_preferences: caregiverPreferences,
        emergency_contact: emergencyContact,
        additional_notes: additionalNotes
      };

      console.log('Updating profile with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { 
          onConflict: 'id' 
        });
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      toast({
        title: 'Registration Complete',
        description: 'Your family caregiver profile has been updated.'
      });

      navigate('/dashboards/family');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.'
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
      <h1 className="text-3xl font-bold mb-6">Family Member Registration</h1>
      <p className="text-gray-500 mb-8">
        Complete your profile to connect with professional caregivers and community resources.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal & Contact Information</CardTitle>
            <CardDescription>
              Tell us about yourself so we can connect you with the right care providers.
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
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled />
              <p className="text-sm text-gray-500">Email address from your registration</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input 
                id="phoneNumber" 
                placeholder="Phone Number" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location – Address/City of the care recipient *</Label>
              <Input 
                id="address" 
                placeholder="Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Care Recipient Information</CardTitle>
            <CardDescription>
              Tell us about the person you are caring for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="careRecipientName">Care Recipient's Full Name – Name of the person needing care *</Label>
              <Input 
                id="careRecipientName" 
                placeholder="Care Recipient Name" 
                value={careRecipientName} 
                onChange={(e) => setCareRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship to Care Recipient *</Label>
              <Select value={relationship} onValueChange={setRelationship} required>
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="Select your relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Grandparent">Grandparent</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Care Type Needed – What type of care is needed? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'care-inhome', label: '🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)', value: 'In-Home Care' },
                  { id: 'care-medical', label: '🏥 Medical Support (Post-surgery, Chronic Condition Management, Hospice)', value: 'Medical Support' },
                  { id: 'care-therapeutic', label: '🌱 Therapeutic Support (Physical Therapy, Occupational Therapy, Speech Therapy)', value: 'Therapeutic Support' },
                  { id: 'care-specialneeds', label: '🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)', value: 'Special Needs Support' },
                  { id: 'care-cognitive', label: '🧠 Cognitive & Memory Care (Alzheimer\'s, Dementia, Parkinson\'s)', value: 'Cognitive & Memory Care' },
                  { id: 'care-mobility', label: '♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)', value: 'Mobility Assistance' },
                  { id: 'care-medication', label: '💊 Medication Management (Daily Medications, Insulin, Medical Equipment)', value: 'Medication Management' },
                  { id: 'care-nutrition', label: '🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)', value: 'Nutritional Assistance' },
                  { id: 'care-household', label: '🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)', value: 'Household Assistance' }
                ].map((item) => (
                  <div key={item.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={careTypes.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        careTypes, 
                        setCareTypes
                      )}
                      className="mt-1"
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caregiverType">Preferred Caregiver Type – Do you prefer care from:</Label>
              <Select value={caregiverType} onValueChange={setCaregiverType}>
                <SelectTrigger id="caregiverType">
                  <SelectValue placeholder="Select Caregiver Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certified Agency">🏥 Certified Agency</SelectItem>
                  <SelectItem value="Independent Caregiver">🏠 Independent Caregiver</SelectItem>
                  <SelectItem value="Either">👩‍⚕️ Either is fine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🟡 Special Medical & Care Needs (Required If Applicable)</CardTitle>
            <CardDescription>
              Detailed information about specific medical conditions and care requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Does the Care Recipient Have Any of These Conditions? (Check all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'needs-cognitive', label: '🧠 Cognitive Disorders – Alzheimer\'s, Dementia, Parkinson\'s', value: 'Cognitive Disorders' },
                  { id: 'needs-physical', label: '♿ Physical Disabilities – Stroke, Paralysis, ALS, Multiple Sclerosis', value: 'Physical Disabilities' },
                  { id: 'needs-chronic', label: '🏥 Chronic Illness – Diabetes, Heart Disease, Cancer, Kidney Disease', value: 'Chronic Illness' },
                  { id: 'needs-specialneeds', label: '🧩 Special Needs (Child or Adult) – Autism, Down Syndrome, Cerebral Palsy, ADHD', value: 'Special Needs' },
                  { id: 'needs-equipment', label: '💊 Medical Equipment Use – Oxygen Tank, Ventilator, Catheter, Feeding Tube', value: 'Medical Equipment Use' },
                  { id: 'needs-vision', label: '👁️ Vision or Hearing Impairment', value: 'Vision or Hearing Impairment' }
                ].map((item) => (
                  <div key={item.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={specialNeeds.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        specialNeeds, 
                        setSpecialNeeds
                      )}
                      className="mt-1"
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherSpecialNeeds">⚠️ Other Special Needs (if any)</Label>
              <Textarea 
                id="otherSpecialNeeds" 
                placeholder="Please specify any other special needs" 
                value={otherSpecialNeeds} 
                onChange={(e) => setOtherSpecialNeeds(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Specialized Care Requirements – Do they need:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'specialized-supervision', label: '🏥 24/7 Supervision', value: '24/7 Supervision' },
                  { id: 'specialized-nurse', label: '🩺 Nurse-Level Medical Assistance', value: 'Nurse-Level Medical Assistance' },
                  { id: 'specialized-diet', label: '🍽️ Special Diet/Nutritional Needs', value: 'Special Diet/Nutritional Needs' },
                  { id: 'specialized-transport', label: '🚗 Transportation to Appointments', value: 'Transportation to Appointments' },
                  { id: 'specialized-language', label: '💬 Sign Language/Language-Specific Care', value: 'Sign Language/Language-Specific Care' }
                ].map((item) => (
                  <div key={item.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={specializedCare.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        specializedCare, 
                        setSpecializedCare
                      )}
                      className="mt-1"
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
            <CardTitle>🟡 Additional Preferences (Optional but Recommended)</CardTitle>
            <CardDescription>
              Help us better understand your specific needs and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="careSchedule">Care Schedule & Availability – Preferred care hours</Label>
              <Input 
                id="careSchedule" 
                placeholder="e.g., Mon-Fri, 8 AM - 5 PM" 
                value={careSchedule} 
                onChange={(e) => setCareSchedule(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caregiverPreferences">Caregiver Preferences – Gender, Age, Language, Experience Level</Label>
              <Textarea 
                id="caregiverPreferences" 
                placeholder="Please specify any preferences regarding your caregiver" 
                value={caregiverPreferences} 
                onChange={(e) => setCaregiverPreferences(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Details – Secondary contact in case of urgent needs</Label>
              <Input 
                id="emergencyContact" 
                placeholder="Name, relationship, phone number" 
                value={emergencyContact} 
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPreferences">Budget Preferences – Expected hourly or monthly care budget</Label>
              <Input 
                id="budgetPreferences" 
                placeholder="Your budget for care services" 
                value={budgetPreferences} 
                onChange={(e) => setBudgetPreferences(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                <SelectTrigger id="preferredContactMethod">
                  <SelectValue placeholder="Select Contact Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea 
                id="additionalNotes" 
                placeholder="Any other information you would like to share" 
                value={additionalNotes} 
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
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

export default FamilyRegistration;
