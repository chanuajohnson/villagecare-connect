
import { useState } from 'react';
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

export default function FamilyRegistration() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    careRecipientName: '',
    relationship: '',
    preferredContactMethod: '',
    additionalNotes: '',
    careSchedule: '',
    budgetPreferences: '',
    caregiverPreferences: '',
  });

  // Define care types and special needs options
  const careTypes = [
    { id: 'inHomeCare', label: '🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)' },
    { id: 'medicalSupport', label: '🏥 Medical Support (Post-surgery, Chronic Condition Management, Hospice)' },
    { id: 'therapeuticSupport', label: '🌱 Therapeutic Support (Physical Therapy, Occupational Therapy, Speech Therapy)' },
    { id: 'specialNeedsSupport', label: '🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)' },
    { id: 'cognitiveCare', label: '🧠 Cognitive & Memory Care (Alzheimer\'s, Dementia, Parkinson\'s)' },
    { id: 'mobilityAssistance', label: '♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)' },
    { id: 'medicationManagement', label: '💊 Medication Management (Daily Medications, Insulin, Medical Equipment)' },
    { id: 'nutritionalAssistance', label: '🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)' },
    { id: 'householdAssistance', label: '🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)' },
  ];

  const specialNeeds = [
    { id: 'cognitiveDisorders', label: '🧠 Cognitive Disorders – Alzheimer\'s, Dementia, Parkinson\'s' },
    { id: 'physicalDisabilities', label: '♿ Physical Disabilities – Stroke, Paralysis, ALS, Multiple Sclerosis' },
    { id: 'chronicIllness', label: '🏥 Chronic Illness – Diabetes, Heart Disease, Cancer, Kidney Disease' },
    { id: 'specialNeedsConditions', label: '🧩 Special Needs (Child or Adult) – Autism, Down Syndrome, Cerebral Palsy, ADHD' },
    { id: 'medicalEquipment', label: '💊 Medical Equipment Use – Oxygen Tank, Ventilator, Catheter, Feeding Tube' },
    { id: 'visionHearingImpairment', label: '👁️ Vision or Hearing Impairment' },
  ];

  const specializedCare = [
    { id: 'fullTimeSupervision', label: '🏥 24/7 Supervision' },
    { id: 'nurseLevelCare', label: '🩺 Nurse-Level Medical Assistance' },
    { id: 'specialDiet', label: '🍽️ Special Diet/Nutritional Needs' },
    { id: 'transportation', label: '🚗 Transportation to Appointments' },
    { id: 'languageSpecificCare', label: '💬 Sign Language/Language-Specific Care' },
  ];

  // State for checkboxes
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([]);
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string[]>([]);
  const [selectedSpecializedCare, setSelectedSpecializedCare] = useState<string[]>([]);
  const [otherSpecialNeeds, setOtherSpecialNeeds] = useState('');
  const [caregiverType, setCaregiverType] = useState('');

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

  const handleCareTypeChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCareTypes(prev => [...prev, id]);
    } else {
      setSelectedCareTypes(prev => prev.filter(item => item !== id));
    }
  };

  const handleSpecialNeedsChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecialNeeds(prev => [...prev, id]);
    } else {
      setSelectedSpecialNeeds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSpecializedCareChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSpecializedCare(prev => [...prev, id]);
    } else {
      setSelectedSpecializedCare(prev => prev.filter(item => item !== id));
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
      !formData.careRecipientName || 
      !formData.relationship || 
      !caregiverType || 
      selectedCareTypes.length === 0
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          address: formData.address,
          care_recipient_name: formData.careRecipientName,
          relationship: formData.relationship,
          care_types: selectedCareTypes,
          special_needs: selectedSpecialNeeds,
          specialized_care: selectedSpecializedCare,
          other_special_needs: otherSpecialNeeds,
          caregiver_type: caregiverType,
          preferred_contact_method: formData.preferredContactMethod,
          care_schedule: formData.careSchedule,
          budget_preferences: formData.budgetPreferences,
          caregiver_preferences: formData.caregiverPreferences,
          additional_notes: formData.additionalNotes,
          role: 'family'
        });
      
      if (error) throw error;
      
      toast.success('Profile completed successfully!');
      navigate('/dashboard/family');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Family Profile</CardTitle>
          <CardDescription>
            Please provide detailed information to help us better understand your family's care needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Essential Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">✅ Essential Fields</h3>
              
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
                  />
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="careRecipientName">Care Recipient's Full Name</Label>
                  <Input 
                    id="careRecipientName"
                    name="careRecipientName"
                    value={formData.careRecipientName}
                    onChange={handleTextChange}
                    placeholder="Name of the person needing care"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship to Care Recipient</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('relationship', value)}
                    value={formData.relationship}
                  >
                    <SelectTrigger id="relationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="legalGuardian">Legal Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Care Type Needed (Select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {careTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type.id} 
                        checked={selectedCareTypes.includes(type.id)}
                        onCheckedChange={(checked) => handleCareTypeChange(type.id, checked === true)}
                      />
                      <Label htmlFor={type.id} className="cursor-pointer">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Caregiver Type</Label>
                <RadioGroup value={caregiverType} onValueChange={setCaregiverType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="certified" id="certified" />
                    <Label htmlFor="certified">🏥 Certified Agency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="independent" id="independent" />
                    <Label htmlFor="independent">🏠 Independent Caregiver</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="either" id="either" />
                    <Label htmlFor="either">👩‍⚕️ Either is fine</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('preferredContactMethod', value)}
                  value={formData.preferredContactMethod}
                >
                  <SelectTrigger id="preferredContactMethod">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Medical & Care Needs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🟡 Special Medical & Care Needs (If Applicable)</h3>
              
              <div className="space-y-2">
                <Label>Does the Care Recipient Have Any of These Conditions? (Check all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {specialNeeds.map((need) => (
                    <div key={need.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={need.id} 
                        checked={selectedSpecialNeeds.includes(need.id)}
                        onCheckedChange={(checked) => handleSpecialNeedsChange(need.id, checked === true)}
                      />
                      <Label htmlFor={need.id} className="cursor-pointer">{need.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherSpecialNeeds">⚠️ Other Special Needs</Label>
                <Textarea 
                  id="otherSpecialNeeds"
                  value={otherSpecialNeeds}
                  onChange={(e) => setOtherSpecialNeeds(e.target.value)}
                  placeholder="Please specify any other special needs"
                />
              </div>

              <div className="space-y-2">
                <Label>Specialized Care Requirements</Label>
                <div className="grid grid-cols-1 gap-2">
                  {specializedCare.map((care) => (
                    <div key={care.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={care.id} 
                        checked={selectedSpecializedCare.includes(care.id)}
                        onCheckedChange={(checked) => handleSpecializedCareChange(care.id, checked === true)}
                      />
                      <Label htmlFor={care.id} className="cursor-pointer">{care.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Preferences Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">🟡 Additional Preferences (Optional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="careSchedule">Care Schedule & Availability</Label>
                <Textarea 
                  id="careSchedule"
                  name="careSchedule"
                  value={formData.careSchedule}
                  onChange={handleTextChange}
                  placeholder="Preferred care hours (e.g., Mon-Fri, 8 AM - 5 PM)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caregiverPreferences">Caregiver Preferences</Label>
                <Textarea 
                  id="caregiverPreferences"
                  name="caregiverPreferences"
                  value={formData.caregiverPreferences}
                  onChange={handleTextChange}
                  placeholder="Gender, Age, Language, Experience Level preferences"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetPreferences">Budget Preferences</Label>
                <Textarea 
                  id="budgetPreferences"
                  name="budgetPreferences"
                  value={formData.budgetPreferences}
                  onChange={handleTextChange}
                  placeholder="Expected hourly or monthly care budget"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea 
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleTextChange}
                  placeholder="Any additional information you'd like to share"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
