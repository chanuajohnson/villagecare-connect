
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Badge, 
  Button, 
  Separator 
} from '@/components/ui/components';
import { 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  Award, 
  Star, 
  Languages, 
  Heart, 
  MapPin,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { SubscriptionModal } from '../subscription/SubscriptionModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const ProfessionalProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [professional, setProfessional] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        if (!id) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('role', 'professional')
          .single();
        
        if (error) {
          console.error('Error fetching professional:', error);
          toast.error('Failed to load caregiver profile');
          setLoading(false);
          return;
        }
        
        setProfessional(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load caregiver profile');
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [id]);

  const handleContactClick = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Profile not found</h2>
        <p className="text-gray-500 mt-2">The caregiver profile you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return 'CG';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={professional.avatar_url || ''} alt={professional.full_name || 'Professional Caregiver'} />
                <AvatarFallback className="text-xl">{getInitials(professional.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{professional.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4" />
                  {professional.professional_type || 'Caregiver'}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {professional.background_check && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                      <Shield className="h-3 w-3" />
                      Background Checked
                    </Badge>
                  )}
                  {professional.certifications && professional.certifications.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Award className="h-3 w-3" />
                      Certified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              className="w-full md:w-auto"
              onClick={handleContactClick}
            >
              Contact to Hire
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-gray-700">{professional.bio || "No bio provided."}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{professional.address || 'Trinidad and Tobago'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Experience</p>
                    <p className="text-gray-600">{professional.years_of_experience || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Availability</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {professional.availability && professional.availability.length > 0 ? 
                        professional.availability.map((time, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {time}
                          </Badge>
                        )) : 
                        <p className="text-gray-600">Not specified</p>
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Languages className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Languages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {professional.languages && professional.languages.length > 0 ? 
                        professional.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {lang}
                          </Badge>
                        )) : 
                        <p className="text-gray-600">English</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Services & Specialties</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Care Services</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {professional.care_services && professional.care_services.length > 0 ? 
                        professional.care_services.map((service, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                            {service}
                          </Badge>
                        )) : 
                        <p className="text-gray-600">Not specified</p>
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Certifications</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {professional.certifications && professional.certifications.length > 0 ? 
                        professional.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-100">
                            {cert}
                          </Badge>
                        )) : 
                        <p className="text-gray-600">Not specified</p>
                      }
                    </div>
                  </div>
                </div>
                
                {professional.license_number && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">License Number</p>
                      <p className="text-gray-600">{professional.license_number}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Expected Rate</p>
                    <p className="text-gray-600">{professional.expected_rate || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">This profile is provided for informational purposes. To contact this caregiver, you need a subscription.</p>
        <Button 
          variant="default"
          className="mt-4"
          onClick={handleContactClick}
        >
          Contact to Hire
        </Button>
      </div>

      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        professional={professional}
      />
    </div>
  );
};
