
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, Heart, Shield, Star, Award, Phone, Mail, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import SubscriptionModal from './SubscriptionModal';

interface Professional {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  years_of_experience: string | null;
  certifications: string[] | null;
  care_services: string[] | null;
  languages: string[] | null;
  location: string | null;
  hourly_rate: string | null;
  availability: string[] | null;
  background_check: boolean | null;
  medical_conditions_experience: string[] | null;
  professional_type: string | null;
}

const ProfessionalProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchProfessionalProfile = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          years_of_experience,
          certifications,
          care_services,
          languages,
          location,
          hourly_rate,
          availability,
          background_check,
          medical_conditions_experience,
          professional_type
        `)
        .eq('id', id)
        .eq('role', 'professional')
        .single();
        
      if (error) {
        console.error('Error fetching professional profile:', error);
        toast.error('Failed to load professional profile');
        return;
      }
      
      setProfessional(data);
    } catch (err) {
      console.error('Error in fetchProfessionalProfile:', err);
      toast.error('Failed to load professional profile');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfessionalProfile();
  }, [id]);
  
  const handleContactRequest = async () => {
    if (!user) {
      toast.error('You must be logged in to contact professionals');
      return;
    }
    
    try {
      // Check if user has an active subscription
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();
        
      if (subscriptionError) {
        console.error('Error checking subscription:', subscriptionError);
        toast.error('Failed to verify subscription status');
        return;
      }
      
      if (subscriptions) {
        // User has an active subscription, allow contact
        toast.success('Contact information unlocked! You can now reach out to this professional.');
        // In a real app, you would display contact info or a messaging interface
      } else {
        // User needs to subscribe
        setSubscriptionModalOpen(true);
      }
    } catch (err) {
      console.error('Error handling contact request:', err);
      toast.error('Failed to process contact request');
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  if (loading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-40 bg-muted rounded"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="h-48 w-48 bg-muted rounded-full"></div>
            <div className="space-y-4 flex-1">
              <div className="h-10 w-60 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!professional) {
    return (
      <div className="container max-w-5xl py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Map
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-2xl font-semibold mb-2">Professional Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the professional caregiver you're looking for.
            </p>
            <Button 
              className="mt-6" 
              onClick={() => navigate('/dashboard/family')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl py-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Map
      </Button>
      
      <Card className="mb-8">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={professional.avatar_url || undefined} />
              <AvatarFallback className="text-4xl">
                {getInitials(professional.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <div>
                <CardTitle className="text-2xl mb-1">{professional.full_name}</CardTitle>
                <CardDescription className="text-lg">
                  {professional.professional_type || 'Professional Caregiver'}
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {professional.background_check && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    Background Checked
                  </Badge>
                )}
                {professional.years_of_experience && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    {professional.years_of_experience} Experience
                  </Badge>
                )}
                {professional.location && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {professional.location}
                  </Badge>
                )}
              </div>
              
              <div className="pt-2">
                <Button onClick={handleContactRequest} className="mr-3">
                  Contact Professional
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">About</h3>
              <p className="text-muted-foreground">
                {professional.bio || 'Professional biography not provided yet.'}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professional.care_services && professional.care_services.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-primary" />
                    Care Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.care_services.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {professional.medical_conditions_experience && professional.medical_conditions_experience.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Medical Experience
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.medical_conditions_experience.map((condition, index) => (
                      <Badge key={index} variant="secondary">{condition}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {professional.certifications && professional.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {professional.languages && professional.languages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.languages.map((language, index) => (
                      <Badge key={index} variant="secondary">{language}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {professional.availability && professional.availability.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.availability.map((time, index) => (
                      <Badge key={index} variant="secondary">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {professional.hourly_rate && (
                <div>
                  <h3 className="font-semibold mb-2">Hourly Rate</h3>
                  <Badge variant="outline" className="text-lg py-1 px-3">
                    ${professional.hourly_rate} / hour
                  </Badge>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Contact Professional</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Subscribe to unlock the ability to contact this professional directly.
              </p>
              <Button onClick={handleContactRequest}>
                Contact Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onClose={() => setSubscriptionModalOpen(false)} 
      />
    </div>
  );
};

export default ProfessionalProfileView;
