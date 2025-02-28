
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export default function CommunityRegistration() {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // State for form sections
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 5;
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Personal & Contact Information
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    location: "",
    website: "",
    avatarUrl: "",
    avatarFile: null as File | null,
    
    // Community Role & Interests
    communityRoles: [] as string[],
    contributionInterests: [] as string[],
    
    // Expertise & Knowledge Sharing
    caregivingExperience: "",
    caregivingAreas: [] as string[],
    techInterests: [] as string[],
    
    // Community Engagement & Preferences
    involvementPreferences: [] as string[],
    communicationChannels: [] as string[],
    
    // Additional Information
    communityMotivation: "",
    improvementIdeas: "",
    listInCommunityDirectory: false,
    enableCommunityNotifications: true,
  });
  
  // Prefill email from user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user]);
  
  // Redirect if not logged in or not a community member
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("You must be logged in to access this page");
      navigate("/auth");
    } else if (!isLoading && userRole && userRole !== 'community') {
      toast.error(`This registration form is for community members only. You are registered as a ${userRole}`);
      navigate(`/registration/${userRole}`);
    }
  }, [user, userRole, isLoading, navigate]);
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        avatarFile: e.target.files[0]
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[field as keyof typeof prev] as string[];
      
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      }
    });
  };
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle radio input changes
  const handleRadioChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle toggle changes
  const handleToggleChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };
  
  // Navigate between form sections
  const goToNextSection = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit this form");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let avatarUrl = formData.avatarUrl;
      
      // Upload avatar if provided
      if (formData.avatarFile) {
        const fileExt = formData.avatarFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData.avatarFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrl;
      }
      
      // Format the full name
      const full_name = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Prepare profile data
      const profileData = {
        full_name,
        phone_number: formData.phoneNumber,
        avatar_url: avatarUrl,
        location: formData.location,
        website: formData.website,
        community_roles: formData.communityRoles,
        contribution_interests: formData.contributionInterests,
        caregiving_experience: formData.caregivingExperience,
        caregiving_areas: formData.caregivingAreas,
        tech_interests: formData.techInterests,
        involvement_preferences: formData.involvementPreferences,
        communication_channels: formData.communicationChannels,
        community_motivation: formData.communityMotivation,
        improvement_ideas: formData.improvementIdeas,
        list_in_community_directory: formData.listInCommunityDirectory,
        enable_community_notifications: formData.enableCommunityNotifications,
      };
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Your community member profile has been saved!");
      navigate("/dashboard/community");
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "An error occurred while saving your profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Community Member Registration</CardTitle>
          <CardDescription className="text-center">
            Complete your profile to join the VillageCare community
          </CardDescription>
          <div className="flex justify-center w-full mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSections }, (_, i) => (
                <div 
                  key={i}
                  className={`h-2 w-10 rounded-full ${
                    i + 1 <= currentSection ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Section 1: Personal & Contact Information */}
            {currentSection === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal & Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture (optional)</Label>
                  <div className="flex items-center space-x-4">
                    {formData.avatarFile && (
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <img
                          src={URL.createObjectURL(formData.avatarFile)}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <Label
                      htmlFor="avatar"
                      className="cursor-pointer flex items-center space-x-2 border rounded-md p-2 hover:bg-muted"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload photo</span>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Auto-filled from your account</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="For community discussions and updates"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location (City & Country) <span className="text-red-500">*</span></Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. San Francisco, USA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">LinkedIn, GitHub, or Personal Website (Optional)</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">For tech contributors and networking</p>
                </div>
              </div>
            )}
            
            {/* Section 2: Community Role & Interests */}
            {currentSection === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Community Role & Interests</h3>
                
                <div className="space-y-3">
                  <Label className="font-medium">What brings you to the VillageCare Community?</Label>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="role-care-champion" 
                        checked={formData.communityRoles.includes("Care Champion")}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("communityRoles", "Care Champion", checked as boolean)
                        }
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor="role-care-champion" 
                          className="font-normal cursor-pointer"
                        >
                          Care Champion
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I want to support families and caregivers through mentorship, resources, and advocacy.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="role-tech-enthusiast" 
                        checked={formData.communityRoles.includes("Tech & Innovation Enthusiast")}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange("communityRoles", "Tech & Innovation Enthusiast", checked as boolean)
                        }
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor="role-tech-enthusiast" 
                          className="font-normal cursor-pointer"
                        >
                          Tech & Innovation Enthusiast
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I'm here for behind-the-scenes insights on how AI, automation, and digital platforms are shaping care.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="font-medium">How would you like to contribute?</Label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "emotional-support",
                        label: "Providing Emotional Support",
                        description: "Offering encouragement, sharing experiences, or being part of support groups."
                      },
                      {
                        id: "volunteering",
                        label: "Volunteering & Advocacy",
                        description: "Participating in caregiving-related initiatives, fundraising, or policy advocacy."
                      },
                      {
                        id: "tech-insights",
                        label: "AI & Tech Insights",
                        description: "Exploring AI solutions for caregiving, providing product feedback, or contributing to beta testing."
                      },
                      {
                        id: "networking",
                        label: "Networking & Collaboration",
                        description: "Connecting with other caregivers, professionals, and innovators."
                      },
                      {
                        id: "content",
                        label: "Content & Storytelling",
                        description: "Writing blog posts, creating videos, or sharing real-life caregiving experiences."
                      }
                    ].map((item) => (
                      <div key={item.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={item.id} 
                          checked={formData.contributionInterests.includes(item.label)}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("contributionInterests", item.label, checked as boolean)
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Section 3: Expertise & Knowledge Sharing */}
            {currentSection === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Expertise & Knowledge Sharing</h3>
                
                <div className="space-y-3">
                  <Label className="font-medium">Do you have any experience in caregiving or healthcare?</Label>
                  <RadioGroup
                    value={formData.caregivingExperience}
                    onValueChange={(value) => handleRadioChange("caregivingExperience", value)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="personal" id="exp-personal" />
                        <Label htmlFor="exp-personal">Yes, I have personal caregiving experience.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="professional" id="exp-professional" />
                        <Label htmlFor="exp-professional">Yes, I am a healthcare professional or have industry knowledge.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="passionate" id="exp-passionate" />
                        <Label htmlFor="exp-passionate">No, but I'm passionate about supporting caregivers.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tech-interested" id="exp-tech" />
                        <Label htmlFor="exp-tech">No, but I'm interested in the tech and AI aspects of caregiving.</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label className="font-medium">If applicable, what areas of caregiving do you have experience in?</Label>
                  <div className="space-y-2">
                    {[
                      "Elderly Care",
                      "Special Needs Care",
                      "Alzheimer's & Dementia Support",
                      "Home Health Assistance",
                      "Palliative & Hospice Care",
                      "Pediatric or Family Care"
                    ].map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`area-${area}`}
                          checked={formData.caregivingAreas.includes(area)}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("caregivingAreas", area, checked as boolean)
                          }
                        />
                        <Label htmlFor={`area-${area}`} className="font-normal cursor-pointer">{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="font-medium">If you're a tech enthusiast, what areas interest you the most?</Label>
                  <div className="space-y-2">
                    {[
                      "AI for Healthcare & Caregiving",
                      "Automation & Workflow Optimization",
                      "Data & Predictive Analytics in Care Coordination",
                      "Ethical AI & Responsible Technology in Health",
                      "UI/UX & Human-Centered Design for Digital Health"
                    ].map((tech) => (
                      <div key={tech} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`tech-${tech}`}
                          checked={formData.techInterests.includes(tech)}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("techInterests", tech, checked as boolean)
                          }
                        />
                        <Label htmlFor={`tech-${tech}`} className="font-normal cursor-pointer">{tech}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Section 4: Community Engagement & Preferences */}
            {currentSection === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Community Engagement & Preferences</h3>
                
                <div className="space-y-3">
                  <Label className="font-medium">How would you like to be involved?</Label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "care-circles",
                        label: "Join Care Circles",
                        description: "Participate in peer-support groups & discussions."
                      },
                      {
                        id: "events",
                        label: "Attend Events & Webinars",
                        description: "Get invited to caregiver support sessions & tech innovation talks."
                      },
                      {
                        id: "testing",
                        label: "Test New Features",
                        description: "Be part of beta testing for caregiving tools & platform updates."
                      },
                      {
                        id: "platform",
                        label: "Help Shape the Platform",
                        description: "Vote on features & provide feedback on user experience."
                      },
                      {
                        id: "collaboration",
                        label: "AI & Tech Developer Collaborations",
                        description: "Engage with AI builders & product innovators."
                      }
                    ].map((involvement) => (
                      <div key={involvement.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={involvement.id}
                          checked={formData.involvementPreferences.includes(involvement.label)}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("involvementPreferences", involvement.label, checked as boolean)
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor={involvement.id} className="font-normal cursor-pointer">{involvement.label}</Label>
                          <p className="text-sm text-muted-foreground">{involvement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="font-medium">Preferred Communication Channels</Label>
                  <div className="space-y-2">
                    {[
                      "Email",
                      "WhatsApp",
                      "Community Forum",
                      "Slack / Discord"
                    ].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`channel-${channel}`}
                          checked={formData.communicationChannels.includes(channel)}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("communicationChannels", channel, checked as boolean)
                          }
                        />
                        <Label htmlFor={`channel-${channel}`} className="font-normal cursor-pointer">{channel}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Section 5: Additional Information & Commitment */}
            {currentSection === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information & Commitment</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="communityMotivation">Why do you want to be part of the VillageCare community?</Label>
                  <Textarea
                    id="communityMotivation"
                    name="communityMotivation"
                    value={formData.communityMotivation}
                    onChange={handleInputChange}
                    placeholder="Share your motivation..."
                    className="h-24"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="improvementIdeas">Do you have any ideas for improving caregiving through community efforts or technology?</Label>
                  <Textarea
                    id="improvementIdeas"
                    name="improvementIdeas"
                    value={formData.improvementIdeas}
                    onChange={handleInputChange}
                    placeholder="Share your ideas..."
                    className="h-24"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="font-medium">Would you like to be publicly listed in the Community Directory?</Label>
                  <RadioGroup
                    value={formData.listInCommunityDirectory ? "yes" : "no"}
                    onValueChange={(value) => handleToggleChange("listInCommunityDirectory", value === "yes")}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="directory-yes" />
                        <Label htmlFor="directory-yes">Yes, I want other community members to find and connect with me.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="directory-no" />
                        <Label htmlFor="directory-no">No, I prefer to contribute privately.</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="notifications"
                    checked={formData.enableCommunityNotifications}
                    onCheckedChange={(checked) => 
                      handleToggleChange("enableCommunityNotifications", checked as boolean)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="notifications" className="font-normal cursor-pointer">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new initiatives, events, and discussions relevant to your interests.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousSection}
              disabled={currentSection === 1}
            >
              Previous
            </Button>
            
            {currentSection < totalSections ? (
              <Button type="button" onClick={goToNextSection}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
