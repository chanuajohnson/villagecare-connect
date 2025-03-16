
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight, UserCheck, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  hourly_rate: string | null;
  location: string | null;
  years_of_experience: string | null;
  care_types: string[] | null;
  specialized_care: string[] | null;
  availability: string[] | null;
  match_score: number;
  is_premium: boolean;
}

// Mock data for demo purposes - same as in CaregiverMatchingPage
const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: "1",
    full_name: "Maria Johnson",
    avatar_url: null,
    hourly_rate: "$18-25",
    location: "Port of Spain",
    years_of_experience: "5+",
    care_types: ["Elderly Care", "Companionship"],
    specialized_care: ["Alzheimer's", "Mobility Assistance"],
    availability: ["Weekdays", "Evenings"],
    match_score: 95,
    is_premium: false
  },
  {
    id: "2",
    full_name: "James Wilson",
    avatar_url: null,
    hourly_rate: "$22-30",
    location: "San Fernando",
    years_of_experience: "8+",
    care_types: ["Special Needs", "Medical Support"],
    specialized_care: ["Autism Care", "Medication Management"],
    availability: ["Full-time", "Weekends"],
    match_score: 89,
    is_premium: true
  }
];

export const DashboardCaregiverMatches = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCaregivers = async () => {
      try {
        setIsLoading(true);
        
        // For demo purposes, we'll use the mock data
        // In production, this would fetch from Supabase based on preferences
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Track view for analytics
        if (user) {
          await trackEngagement('dashboard_caregiver_matches_view');
        }
        
        setCaregivers(MOCK_CAREGIVERS);
      } catch (error) {
        console.error("Error loading caregivers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadCaregivers();
    }
  }, [user]);
  
  const trackEngagement = async (actionType: string, additionalData = {}) => {
    try {
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
      // Store the session ID if it's new
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      const { error } = await supabase.from('cta_engagement_tracking').insert({
        user_id: user?.id || null,
        action_type: actionType,
        session_id: sessionId,
        additional_data: additionalData
      });
      
      if (error) {
        console.error("Error tracking engagement:", error);
      }
    } catch (error) {
      console.error("Error in trackEngagement:", error);
    }
  };

  // Only show this component for logged-in users
  if (!user) {
    return null;
  }

  // If user's profile is incomplete, show a prompt to complete it
  if (!isProfileComplete) {
    return (
      <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Complete Your Profile for Caregiver Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Provide your care preferences to see personalized caregiver matches that fit your specific needs.
          </p>
          <Button 
            onClick={() => navigate("/registration/family", { 
              state: { returnPath: "/caregiver-matching", action: "findCaregiver" }
            })}
          >
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Top Caregiver Matches</CardTitle>
          <p className="text-sm text-gray-500">Based on your care preferences</p>
        </div>
        <Button 
          variant="default" 
          className="flex items-center gap-1"
          onClick={() => {
            trackEngagement('view_all_matches_click');
            navigate("/caregiver-matching");
          }}
        >
          View All Matches
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : caregivers.length > 0 ? (
          <div className="space-y-4">
            {caregivers.map((caregiver) => (
              <div 
                key={caregiver.id}
                className={`p-4 rounded-lg border ${caregiver.is_premium ? 'border-amber-300' : 'border-gray-200'} relative`}
              >
                {caregiver.is_premium && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                      Premium
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Profile Section */}
                  <div className="flex flex-col items-center sm:items-start sm:w-1/5">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={caregiver.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                        {caregiver.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-2 text-center sm:text-left">
                      <h3 className="font-semibold">{caregiver.full_name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{caregiver.location}</span>
                      </div>
                      <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
                        <span className="text-sm font-medium text-primary-700">{caregiver.match_score}% Match</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  <div className="sm:w-2/5 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Rate:</span>
                      <span>{caregiver.hourly_rate}/hr</span>
                      <span className="mx-1">•</span>
                      <span className="font-medium">Experience:</span>
                      <span>{caregiver.years_of_experience} Years</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Care Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Availability:</span>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.availability?.map((avail, i) => (
                          <div key={i} className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <Clock className="h-3 w-3" />
                            <span>{avail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Section */}
                  <div className="sm:w-2/5 md:w-1/5 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Background Checked</span>
                    </div>
                    
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-amber-500" />
                      ))}
                    </div>
                    
                    <Button 
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        trackEngagement('contact_caregiver_click', { caregiver_id: caregiver.id });
                        if (caregiver.is_premium) {
                          navigate("/subscription", { 
                            state: { 
                              returnPath: "/caregiver-matching",
                              featureType: "Premium Profiles",
                              caregiverId: caregiver.id
                            } 
                          });
                        } else {
                          toast.success("Request sent! The caregiver will contact you shortly.");
                        }
                      }}
                    >
                      {caregiver.is_premium ? "Unlock Profile" : "Contact Caregiver"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => {
                trackEngagement('view_all_matches_click');
                navigate("/caregiver-matching");
              }}
            >
              View All Caregiver Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">We're still finding caregivers that match your preferences</p>
            <Button 
              variant="default"
              onClick={() => navigate("/caregiver-matching")}
            >
              Find Caregivers Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
