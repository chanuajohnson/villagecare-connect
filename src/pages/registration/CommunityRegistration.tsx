
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
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Switch } from '../../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

const CommunityRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [communityRoles, setCommunityRoles] = useState<string[]>([]);
  const [contributionInterests, setContributionInterests] = useState<string[]>([]);
  const [caregivingExperience, setCaregivingExperience] = useState('');
  const [caregivingAreas, setCaregivingAreas] = useState<string[]>([]);
  const [techInterests, setTechInterests] = useState<string[]>([]);
  const [involvementPreferences, setInvolvementPreferences] = useState<string[]>([]);
  const [communicationChannels, setCommunicationChannels] = useState<string[]>([]);
  const [communityMotivation, setCommunityMotivation] = useState('');
  const [improvementIdeas, setImprovementIdeas] = useState('');
  const [listInDirectory, setListInDirectory] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
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
          setLocation(profileData.location || '');
          setWebsite(profileData.website || '');
          setCommunityRoles(profileData.community_roles || []);
          setContributionInterests(profileData.contribution_interests || []);
          setCaregivingExperience(profileData.caregiving_experience || '');
          setCaregivingAreas(profileData.caregiving_areas || []);
          setTechInterests(profileData.tech_interests || []);
          setInvolvementPreferences(profileData.involvement_preferences || []);
          setCommunicationChannels(profileData.communication_channels || []);
          setCommunityMotivation(profileData.community_motivation || '');
          setImprovementIdeas(profileData.improvement_ideas || '');
          setListInDirectory(profileData.list_in_community_directory || false);
          setEnableNotifications(profileData.enable_community_notifications || true);
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
        role: 'community' as const,
        updated_at: new Date().toISOString(),
        location,
        website,
        community_roles: communityRoles,
        contribution_interests: contributionInterests,
        caregiving_experience: caregivingExperience,
        caregiving_areas: caregivingAreas,
        tech_interests: techInterests,
        involvement_preferences: involvementPreferences,
        communication_channels: communicationChannels,
        community_motivation: communityMotivation,
        improvement_ideas: improvementIdeas,
        list_in_community_directory: listInDirectory,
        enable_community_notifications: enableNotifications
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Registration Complete',
        description: 'Your community member profile has been updated.'
      });

      // Redirect to community dashboard
      navigate('/dashboards/community');
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
      <h1 className="text-3xl font-bold mb-6">Community Member Registration</h1>
      <p className="text-gray-500 mb-8">
        Join our vibrant community of caregivers, tech enthusiasts, and advocates.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal & Contact Information</CardTitle>
            <CardDescription>
              Tell us about yourself so we can connect you with the right community members.
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
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location" 
                placeholder="City, Country" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">LinkedIn, GitHub, or Personal Website (Optional)</Label>
              <Input 
                id="website" 
                placeholder="https://" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Community Role & Interests</CardTitle>
            <CardDescription>
              Tell us why you're joining VillageCare Community and how you'd like to contribute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>What brings you to the VillageCare Community?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-care-champion" 
                    checked={communityRoles.includes('Care Champion')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommunityRoles([...communityRoles, 'Care Champion']);
                      } else {
                        setCommunityRoles(communityRoles.filter(role => role !== 'Care Champion'));
                      }
                    }}
                  />
                  <Label htmlFor="role-care-champion" className="font-normal">
                    Care Champion: I want to support families and caregivers through mentorship, resources, and advocacy.
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-tech-enthusiast" 
                    checked={communityRoles.includes('Tech & Innovation Enthusiast')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommunityRoles([...communityRoles, 'Tech & Innovation Enthusiast']);
                      } else {
                        setCommunityRoles(communityRoles.filter(role => role !== 'Tech & Innovation Enthusiast'));
                      }
                    }}
                  />
                  <Label htmlFor="role-tech-enthusiast" className="font-normal">
                    Tech & Innovation Enthusiast: I'm here for behind-the-scenes insights on how AI, automation, and digital platforms are shaping care.
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>How would you like to contribute? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'contrib-support', label: 'Providing Emotional Support', value: 'Emotional Support' },
                  { id: 'contrib-volunteer', label: 'Volunteering & Advocacy', value: 'Volunteering & Advocacy' },
                  { id: 'contrib-tech', label: 'AI & Tech Insights', value: 'AI & Tech Insights' },
                  { id: 'contrib-network', label: 'Networking & Collaboration', value: 'Networking & Collaboration' },
                  { id: 'contrib-content', label: 'Content & Storytelling', value: 'Content & Storytelling' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={contributionInterests.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        contributionInterests, 
                        setContributionInterests
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
            <CardTitle>Expertise & Knowledge Sharing</CardTitle>
            <CardDescription>
              Share your experience and interests to help us connect you with relevant opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Do you have any experience in caregiving or healthcare?</Label>
              <RadioGroup value={caregivingExperience} onValueChange={setCaregivingExperience}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Personal caregiving experience" id="exp-personal" />
                  <Label htmlFor="exp-personal" className="font-normal">Yes, I have personal caregiving experience.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Healthcare professional" id="exp-professional" />
                  <Label htmlFor="exp-professional" className="font-normal">Yes, I am a healthcare professional or have industry knowledge.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Passionate about supporting" id="exp-passionate" />
                  <Label htmlFor="exp-passionate" className="font-normal">No, but I'm passionate about supporting caregivers.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Interested in tech aspects" id="exp-tech" />
                  <Label htmlFor="exp-tech" className="font-normal">No, but I'm interested in the tech and AI aspects of caregiving.</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>If applicable, what areas of caregiving do you have experience in? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'area-elderly', label: 'Elderly Care', value: 'Elderly Care' },
                  { id: 'area-special', label: 'Special Needs Care', value: 'Special Needs Care' },
                  { id: 'area-dementia', label: 'Alzheimer\'s & Dementia Support', value: 'Alzheimer\'s & Dementia Support' },
                  { id: 'area-home', label: 'Home Health Assistance', value: 'Home Health Assistance' },
                  { id: 'area-hospice', label: 'Palliative & Hospice Care', value: 'Palliative & Hospice Care' },
                  { id: 'area-pediatric', label: 'Pediatric or Family Care', value: 'Pediatric or Family Care' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={caregivingAreas.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        caregivingAreas, 
                        setCaregivingAreas
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>If you're a tech enthusiast, what areas interest you the most? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'tech-ai', label: 'AI for Healthcare & Caregiving', value: 'AI for Healthcare & Caregiving' },
                  { id: 'tech-automation', label: 'Automation & Workflow Optimization', value: 'Automation & Workflow Optimization' },
                  { id: 'tech-data', label: 'Data & Predictive Analytics in Care Coordination', value: 'Data & Predictive Analytics' },
                  { id: 'tech-ethics', label: 'Ethical AI & Responsible Technology in Health', value: 'Ethical AI & Responsible Technology' },
                  { id: 'tech-design', label: 'UI/UX & Human-Centered Design for Digital Health', value: 'UI/UX & Human-Centered Design' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={techInterests.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        techInterests, 
                        setTechInterests
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
            <CardTitle>Community Engagement & Preferences</CardTitle>
            <CardDescription>
              Let us know how you'd like to participate in the community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>How would you like to be involved? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'involve-circles', label: 'Join Care Circles', value: 'Join Care Circles' },
                  { id: 'involve-events', label: 'Attend Events & Webinars', value: 'Attend Events & Webinars' },
                  { id: 'involve-test', label: 'Test New Features', value: 'Test New Features' },
                  { id: 'involve-shape', label: 'Help Shape the Platform', value: 'Help Shape the Platform' },
                  { id: 'involve-dev', label: 'AI & Tech Developer Collaborations', value: 'AI & Tech Developer Collaborations' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={involvementPreferences.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        involvementPreferences, 
                        setInvolvementPreferences
                      )}
                    />
                    <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Preferred Communication Channels: (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'comm-email', label: 'Email', value: 'Email' },
                  { id: 'comm-whatsapp', label: 'WhatsApp', value: 'WhatsApp' },
                  { id: 'comm-forum', label: 'Community Forum', value: 'Community Forum' },
                  { id: 'comm-slack', label: 'Slack / Discord', value: 'Slack / Discord' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={communicationChannels.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        communicationChannels, 
                        setCommunicationChannels
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
            <CardTitle>Additional Information & Commitment</CardTitle>
            <CardDescription>
              Share your motivation and ideas for the community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="motivation">Why do you want to be part of the VillageCare community?</Label>
              <Textarea 
                id="motivation" 
                placeholder="Share your motivation..." 
                value={communityMotivation} 
                onChange={(e) => setCommunityMotivation(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ideas">Do you have any ideas for improving caregiving through community efforts or technology?</Label>
              <Textarea 
                id="ideas" 
                placeholder="Share your ideas..." 
                value={improvementIdeas} 
                onChange={(e) => setImprovementIdeas(e.target.value)}
                rows={4}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Would you like to be publicly listed in the Community Directory?</Label>
              <RadioGroup value={listInDirectory ? 'yes' : 'no'} onValueChange={(value) => setListInDirectory(value === 'yes')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="directory-yes" />
                  <Label htmlFor="directory-yes" className="font-normal">Yes, I want other community members to find and connect with me.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="directory-no" />
                  <Label htmlFor="directory-no" className="font-normal">No, I prefer to contribute privately.</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="notifications" 
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
              <Label htmlFor="notifications" className="font-normal">
                Enable Notifications
              </Label>
            </div>
            <p className="text-sm text-gray-500">
              Receive updates about new initiatives, events, and discussions relevant to your interests.
            </p>
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

export default CommunityRegistration;
