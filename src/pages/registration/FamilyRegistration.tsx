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
  const [address, setAddress] = useState('');
  const [careRecipientName, setCareRecipientName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [specializedCare, setSpecializedCare] = useState<string[]>([]);
  const [otherSpecialNeeds, setOtherSpecialNeeds] = useState('');
  const [caregiverType, setCaregiverType] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [careSchedule, setCareSchedule] = useState('');
  const [budgetPreferences, setBudgetPreferences] = useState('');
  const [caregiverPreferences, setCaregiverPreferences] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
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
          setAdditionalNotes(profileData.additional_notes || '');
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
        phone_number: phoneNumber,
        address: address,
        role: 'family' as const,
        updated_at: new Date().toISOString(),
        care_recipient_name: careRecipientName,
        relationship: relationship,
        care_types: careTypes,
        special_needs: specialNeeds,
        specialized_care: specializedCare,
        other_special_needs: otherSpecialNeeds,
        caregiver_type: caregiverType,
        preferred_contact_method: preferredContactMethod,
        care_schedule: careSchedule,
        budget_preferences: budgetPreferences,
        caregiver_preferences: caregiverPreferences,
        additional_notes: additionalNotes
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Registration Complete',
        description: 'Your family caregiver profile has been updated.'
      });

      // Redirect to family dashboard
      navigate('/dashboards/family');
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
      <h1 className="text-3xl font-bold mb-6">Family Caregiver Registration</h1>
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
              <Input id="email" type="email" value={user?.email || ''} disabled />
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
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
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
              <Label htmlFor="careRecipientName">Care Recipient Name</Label>
              <Input 
                id="careRecipientName" 
                placeholder="Care Recipient Name" 
                value={careRecipientName} 
                onChange={(e) => setCareRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship to Care Recipient</Label>
              <Input 
                id="relationship" 
                placeholder="Relationship" 
                value={relationship} 
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Types of Care Needed</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'care-mobility', label: 'Mobility Assistance', value: 'Mobility Assistance' },
                  { id: 'care-meals', label: 'Meal Preparation', value: 'Meal Preparation' },
                  { id: 'care-medication', label: 'Medication Management', value: 'Medication Management' },
                  { id: 'care-hygiene', label: 'Personal Hygiene', value: 'Personal Hygiene' },
                  { id: 'care-companionship', label: 'Companionship', value: 'Companionship' },
                  { id: 'care-transportation', label: 'Transportation', value: 'Transportation' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={careTypes.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        careTypes, 
                        setCareTypes
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Needs</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'needs-alzheimer', label: 'Alzheimer\'s', value: 'Alzheimer\'s' },
                  { id: 'needs-dementia', label: 'Dementia', value: 'Dementia' },
                  { id: 'needs-parkinson', label: 'Parkinson\'s', value: 'Parkinson\'s' },
                  { id: 'needs-diabetes', label: 'Diabetes', value: 'Diabetes' },
                  { id: 'needs-arthritis', label: 'Arthritis', value: 'Arthritis' },
                  { id: 'needs-cancer', label: 'Cancer', value: 'Cancer' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={specialNeeds.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        specialNeeds, 
                        setSpecialNeeds
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specialized Care Requirements</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'care-skilled-nursing', label: 'Skilled Nursing', value: 'Skilled Nursing' },
                  { id: 'care-physical-therapy', label: 'Physical Therapy', value: 'Physical Therapy' },
                  { id: 'care-occupational-therapy', label: 'Occupational Therapy', value: 'Occupational Therapy' },
                  { id: 'care-speech-therapy', label: 'Speech Therapy', value: 'Speech Therapy' },
                  { id: 'care-hospice', label: 'Hospice Care', value: 'Hospice Care' },
                  { id: 'care-palliative', label: 'Palliative Care', value: 'Palliative Care' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={specializedCare.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        specializedCare, 
                        setSpecializedCare
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherSpecialNeeds">Other Special Needs (if any)</Label>
              <Textarea 
                id="otherSpecialNeeds" 
                placeholder="Other Special Needs" 
                value={otherSpecialNeeds} 
                onChange={(e) => setOtherSpecialNeeds(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Caregiver Preferences</CardTitle>
            <CardDescription>
              Let us know your preferences for the caregiver.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caregiverType">Preferred Caregiver Type</Label>
              <Select value={caregiverType} onValueChange={setCaregiverType}>
                <SelectTrigger id="caregiverType">
                  <SelectValue placeholder="Select Caregiver Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional Caregiver</SelectItem>
                  <SelectItem value="familyFriend">Family Friend</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="careSchedule">Care Schedule</Label>
              <Input 
                id="careSchedule" 
                placeholder="Care Schedule" 
                value={careSchedule} 
                onChange={(e) => setCareSchedule(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPreferences">Budget Preferences</Label>
              <Input 
                id="budgetPreferences" 
                placeholder="Budget Preferences" 
                value={budgetPreferences} 
                onChange={(e) => setBudgetPreferences(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caregiverPreferences">Caregiver Preferences</Label>
              <Textarea 
                id="caregiverPreferences" 
                placeholder="Caregiver Preferences" 
                value={caregiverPreferences} 
                onChange={(e) => setCaregiverPreferences(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea 
                id="additionalNotes" 
                placeholder="Additional Notes" 
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
