
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserIcon, Clock, Award, MapPin, Mail, Phone, Briefcase, Star, Heart, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import SubscriptionModal from './SubscriptionModal';
import { Profile } from '@/types/database';
import { motion } from 'framer-motion';

interface ProfessionalLocation {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

const ProfessionalProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [professional, setProfessional] = useState<Profile | null>(null);
  const [location, setLocation] = useState<ProfessionalLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { user, requireAuth } = useAuth();

  const fetchProfessionalProfile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'professional')
        .single();

      if (error) {
        console.error('Error fetching professional profile:', error);
        toast.error('Failed to load professional profile');
        return;
      }

      if (data) {
        setProfessional(data);
        
        // Fetch location data
        const { data: locationData, error: locationError } = await supabase
          .from('professional_locations')
          .select('*')
          .eq('user_id', id)
          .single();

        if (!locationError && locationData) {
          setLocation(locationData);
        }
      }
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

  const handleContactClick = () => {
    if (!requireAuth('contact this professional')) return;
    
    // Check if user has an active subscription
    checkSubscription();
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      // Check if user has an active subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .single();

      if (error || !data) {
        // No active subscription, show subscription modal
        setShowSubscriptionModal(true);
      } else {
        // User has an active subscription, allow contact
        toast.success('You can now contact this professional directly');
        // Here you would typically open a contact form or reveal contact information
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      toast.error('Failed to check subscription status');
    }
  };

  if (loading) {
    return (
      <div className="container p-4 mx-auto flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-primary border-b-transparent border-l-transparent border-r-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="container p-4 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              The professional profile you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container p-4 mx-auto"
    >
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {professional.avatar_url ? (
                  <img 
                    src={professional.avatar_url} 
                    alt={professional.full_name || 'Professional'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{professional.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{professional.professional_type || 'Professional Caregiver'}</span>
                </CardDescription>
                {location?.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location.city}, {location.country || 'Trinidad and Tobago'}</span>
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleContactClick}
              className="md:self-start"
            >
              Contact Professional
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Professional Information
              </h3>
              
              <dl className="space-y-4">
                {professional.years_of_experience && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Experience</dt>
                    <dd className="flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{professional.years_of_experience} years</span>
                    </dd>
                  </div>
                )}
                
                {professional.care_services && professional.care_services.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Services</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {professional.care_services.map((service, idx) => (
                        <Badge key={idx} variant="outline">{service}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
                
                {professional.languages && professional.languages.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Languages</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {professional.languages.map((language, idx) => (
                        <Badge key={idx} variant="secondary">{language}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
                
                {professional.work_type && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Work Type</dt>
                    <dd>{professional.work_type}</dd>
                  </div>
                )}
                
                {professional.availability && professional.availability.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Availability</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {professional.availability.map((time, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-50">{time}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                About
              </h3>
              
              {professional.bio ? (
                <p className="text-muted-foreground">{professional.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio provided</p>
              )}
              
              {professional.why_choose_caregiving && (
                <>
                  <h4 className="font-medium mt-4 mb-2">Why I Choose Caregiving</h4>
                  <p className="text-muted-foreground">{professional.why_choose_caregiving}</p>
                </>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Qualifications
              </h3>
              
              <dl className="space-y-4">
                {professional.certifications && professional.certifications.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Certifications</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {professional.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50">{cert}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
                
                {professional.license_number && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">License Number</dt>
                    <dd>
                      <Badge variant="outline">{professional.license_number}</Badge>
                    </dd>
                  </div>
                )}
                
                {professional.background_check && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24"
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="text-green-600"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-700">Background Check Verified</p>
                      <p className="text-sm text-green-600">This professional has passed a background check</p>
                    </div>
                  </div>
                )}
              </dl>
              
              {(professional.expected_rate || professional.payment_methods) && (
                <>
                  <Separator className="my-6" />
                  
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Rates & Scheduling
                  </h3>
                  
                  <dl className="space-y-4">
                    {professional.expected_rate && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Expected Rate</dt>
                        <dd className="font-medium text-lg">{professional.expected_rate}</dd>
                      </div>
                    )}
                    
                    {professional.payment_methods && professional.payment_methods.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Payment Methods</dt>
                        <dd className="flex flex-wrap gap-2 mt-1">
                          {professional.payment_methods.map((method, idx) => (
                            <Badge key={idx} variant="outline">{method}</Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </motion.div>
  );
};

export default ProfessionalProfileView;
