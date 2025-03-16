
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Filter, MapPin, DollarSign, Star, Lock, BookOpen, UserCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

// Mock data for demo purposes
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
  },
  {
    id: "3",
    full_name: "Sophia Thomas",
    avatar_url: null,
    hourly_rate: "$20-28",
    location: "Arima",
    years_of_experience: "3+",
    care_types: ["Child Care", "Housekeeping"],
    specialized_care: ["Early Childhood Development", "Meal Preparation"],
    availability: ["Part-time", "Mornings"],
    match_score: 82,
    is_premium: false
  },
  {
    id: "4",
    full_name: "Robert Garcia",
    avatar_url: null,
    hourly_rate: "$25-35",
    location: "Chaguanas",
    years_of_experience: "10+",
    care_types: ["Elderly Care", "Overnight Care"],
    specialized_care: ["Dementia Care", "Stroke Recovery"],
    availability: ["Overnight", "Weekends"],
    match_score: 78,
    is_premium: true
  }
];

export default function CaregiverMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [careType, setCareType] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");
  
  useEffect(() => {
    const loadCaregivers = async () => {
      try {
        setIsLoading(true);
        
        // For demo purposes, we'll use the mock data
        // In production, this would fetch from Supabase based on preferences
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Track page view
        await trackEngagement('caregiver_matching_page_view');
        
        // Sort caregivers based on selected sort
        let sortedCaregivers = [...MOCK_CAREGIVERS];
        
        if (sortBy === "match") {
          sortedCaregivers.sort((a, b) => b.match_score - a.match_score);
        } else if (sortBy === "price_low") {
          sortedCaregivers.sort((a, b) => {
            const aPrice = parseInt(a.hourly_rate?.split('-')[0].replace('$', '') || '0');
            const bPrice = parseInt(b.hourly_rate?.split('-')[0].replace('$', '') || '0');
            return aPrice - bPrice;
          });
        } else if (sortBy === "price_high") {
          sortedCaregivers.sort((a, b) => {
            const aPrice = parseInt(a.hourly_rate?.split('-')[0].replace('$', '') || '0');
            const bPrice = parseInt(b.hourly_rate?.split('-')[0].replace('$', '') || '0');
            return bPrice - aPrice;
          });
        } else if (sortBy === "experience") {
          sortedCaregivers.sort((a, b) => {
            const aExp = parseInt(a.years_of_experience?.replace('+', '') || '0');
            const bExp = parseInt(b.years_of_experience?.replace('+', '') || '0');
            return bExp - aExp;
          });
        }
        
        setCaregivers(sortedCaregivers);
      } catch (error) {
        console.error("Error loading caregivers:", error);
        toast.error("Failed to load caregiver matches");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isProfileComplete) {
      loadCaregivers();
    } else if (user && !isProfileComplete) {
      navigate("/registration/family", { 
        state: { returnPath: "/caregiver-matching", action: "findCaregiver" }
      });
    } else if (!user) {
      navigate("/auth", { 
        state: { returnPath: "/caregiver-matching", action: "findCaregiver" }
      });
    }
  }, [user, isProfileComplete, navigate, sortBy]);
  
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
  
  const handleContactCaregiver = async (caregiverId: string, isPremium: boolean) => {
    await trackEngagement('contact_caregiver_click', { caregiver_id: caregiverId, is_premium: isPremium });
    
    if (isPremium) {
      navigate("/subscription", { 
        state: { 
          returnPath: "/caregiver-matching",
          featureType: "Premium Caregiver Profiles",
          caregiverId: caregiverId
        } 
      });
    } else {
      toast.success("Request sent! The caregiver will contact you shortly.");
    }
  };
  
  // Filter caregivers based on selected filters
  const filteredCaregivers = caregivers.filter(caregiver => {
    let matchesCareType = true;
    let matchesAvailability = true;
    let matchesPriceRange = true;
    
    // Filter by care type
    if (careType !== "all" && caregiver.care_types) {
      matchesCareType = caregiver.care_types.some(type => 
        type.toLowerCase().includes(careType.toLowerCase())
      );
    }
    
    // Filter by availability
    if (availability !== "all" && caregiver.availability) {
      matchesAvailability = caregiver.availability.some(avail => 
        avail.toLowerCase().includes(availability.toLowerCase())
      );
    }
    
    // Filter by price range
    if (priceRange !== "all" && caregiver.hourly_rate) {
      const minPrice = parseInt(caregiver.hourly_rate.split('-')[0].replace('$', ''));
      if (priceRange === "under20" && minPrice > 20) matchesPriceRange = false;
      if (priceRange === "20to30" && (minPrice < 20 || minPrice > 30)) matchesPriceRange = false;
      if (priceRange === "over30" && minPrice < 30) matchesPriceRange = false;
    }
    
    return matchesCareType && matchesAvailability && matchesPriceRange;
  });
  
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Caregiver Matches</h1>
        <p className="text-gray-600">
          We've found {filteredCaregivers.length} caregivers that match your profile requirements
        </p>
      </div>
      
      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filter & Sort</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="careType">Care Type</Label>
              <Select
                value={careType}
                onValueChange={setCareType}
              >
                <SelectTrigger id="careType">
                  <SelectValue placeholder="All Care Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Care Types</SelectItem>
                  <SelectItem value="elderly">Elderly Care</SelectItem>
                  <SelectItem value="special">Special Needs</SelectItem>
                  <SelectItem value="child">Child Care</SelectItem>
                  <SelectItem value="medical">Medical Support</SelectItem>
                  <SelectItem value="overnight">Overnight Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={availability}
                onValueChange={setAvailability}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="All Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="overnight">Overnight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priceRange">Price Range</Label>
              <Select
                value={priceRange}
                onValueChange={setPriceRange}
              >
                <SelectTrigger id="priceRange">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under20">Under $20/hr</SelectItem>
                  <SelectItem value="20to30">$20-$30/hr</SelectItem>
                  <SelectItem value="over30">Over $30/hr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Best Match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCaregivers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No caregivers match your current filters</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setCareType("all");
              setAvailability("all");
              setPriceRange("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Premium Upsell Banner */}
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <p className="font-medium text-amber-800">
                  Unlock Premium Matching: Upgrade for priority placement & access to exclusive caregiver profiles.
                </p>
              </div>
              <Button 
                variant="default" 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  trackEngagement('premium_matching_cta_click');
                  navigate("/subscription", { 
                    state: { 
                      returnPath: "/caregiver-matching",
                      featureType: "Premium Matching" 
                    } 
                  });
                }}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
          
          {/* Caregiver Cards */}
          {filteredCaregivers.map((caregiver) => (
            <Card 
              key={caregiver.id} 
              className={`relative overflow-hidden ${caregiver.is_premium ? 'border-amber-300 shadow-amber-100' : ''}`}
            >
              {caregiver.is_premium && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                    Premium
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Profile Section */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={caregiver.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                          {caregiver.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-3 text-center">
                        <h3 className="text-lg font-semibold">{caregiver.full_name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{caregiver.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 w-full rounded-lg p-2 text-center">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <div className="text-2xl font-bold text-primary-700">{caregiver.match_score}%</div>
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  <div className="col-span-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Hourly Rate</div>
                          <div className="font-medium">{caregiver.hourly_rate}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Experience</div>
                          <div className="font-medium">{caregiver.years_of_experience} Years</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Care Specialties</div>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Special Care Expertise</div>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.specialized_care?.map((specialty, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Availability</div>
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
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Background Checked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleContactCaregiver(caregiver.id, caregiver.is_premium)}
                      >
                        {caregiver.is_premium ? "Unlock Profile" : "Contact Caregiver"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          trackEngagement('view_full_profile_click', { caregiver_id: caregiver.id });
                          if (caregiver.is_premium) {
                            navigate("/subscription", { 
                              state: { 
                                returnPath: "/caregiver-matching",
                                featureType: "Premium Profiles",
                                caregiverId: caregiver.id
                              } 
                            });
                          } else {
                            toast.info("Full profile view is coming soon!");
                          }
                        }}
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
