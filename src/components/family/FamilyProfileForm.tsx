
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FamilyProfileForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    relationship: "",
    careType: "",
    carePreferences: "",
    preferredCaregiverType: "",
    careSchedule: "",
    specialRequirements: "",
    location: "",
    contactNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.relationship || !formData.careType || 
        !formData.preferredCaregiverType || !formData.location || !formData.contactNumber) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("family_profiles")
        .insert([
          {
            user_id: user?.id,
            full_name: formData.fullName,
            relationship: formData.relationship,
            care_type: formData.careType,
            care_preferences: formData.carePreferences,
            preferred_caregiver_type: formData.preferredCaregiverType,
            care_schedule: formData.careSchedule,
            special_requirements: formData.specialRequirements,
            location: formData.location,
            contact_number: formData.contactNumber,
          },
        ]);

      if (error) {
        throw error;
      }

      toast.success("Profile completed successfully!");
      navigate("/dashboard/family");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Complete Your Family Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Name of the Person Needing Care *</Label>
            <Input 
              id="fullName" 
              name="fullName" 
              placeholder="Enter full name" 
              value={formData.fullName} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Your Relationship to Them *</Label>
            <Select 
              value={formData.relationship} 
              onValueChange={(value) => handleSelectChange(value, "relationship")}
              required
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select Relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="grandparent">Grandparent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Care Type */}
          <div className="space-y-2">
            <Label htmlFor="careType">Type of Care Needed *</Label>
            <Select 
              value={formData.careType} 
              onValueChange={(value) => handleSelectChange(value, "careType")}
              required
            >
              <SelectTrigger id="careType">
                <SelectValue placeholder="Select Care Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daytime">Daytime Care</SelectItem>
                <SelectItem value="nighttime">Nighttime Care</SelectItem>
                <SelectItem value="full-time">Full-Time Live-in Care</SelectItem>
                <SelectItem value="weekends">Weekend Care</SelectItem>
                <SelectItem value="short-term">Short-Term Care</SelectItem>
                <SelectItem value="long-term">Long-Term Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Caregiver Type */}
          <div className="space-y-2">
            <Label htmlFor="preferredCaregiverType">Do You Prefer an Agency or an Independent Caregiver? *</Label>
            <Select 
              value={formData.preferredCaregiverType} 
              onValueChange={(value) => handleSelectChange(value, "preferredCaregiverType")}
              required
            >
              <SelectTrigger id="preferredCaregiverType">
                <SelectValue placeholder="Select Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agency">Agency</SelectItem>
                <SelectItem value="independent">Independent Caregiver</SelectItem>
                <SelectItem value="no_preference">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Care Schedule */}
          <div className="space-y-2">
            <Label htmlFor="careSchedule">Preferred Schedule (Optional)</Label>
            <Input 
              id="careSchedule" 
              name="careSchedule" 
              placeholder="E.g., Monday - Friday, 8 AM - 5 PM" 
              value={formData.careSchedule} 
              onChange={handleInputChange} 
            />
          </div>

          {/* Care Preferences */}
          <div className="space-y-2">
            <Label htmlFor="carePreferences">Specific Care Preferences (Optional)</Label>
            <Textarea 
              id="carePreferences" 
              name="carePreferences" 
              placeholder="E.g., Special training needed, cultural or language preferences" 
              value={formData.carePreferences} 
              onChange={handleInputChange} 
            />
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Any Special Requirements? (Optional)</Label>
            <Textarea 
              id="specialRequirements" 
              name="specialRequirements" 
              placeholder="E.g., Medication management, mobility assistance, memory care" 
              value={formData.specialRequirements} 
              onChange={handleInputChange} 
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (City/State) *</Label>
            <Input 
              id="location" 
              name="location" 
              placeholder="Enter location" 
              value={formData.location} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Your Contact Number *</Label>
            <Input 
              id="contactNumber" 
              name="contactNumber" 
              placeholder="Enter phone number" 
              value={formData.contactNumber} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
