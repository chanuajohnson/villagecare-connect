
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Filter, MapPin, DollarSign, Star, Lock, BookOpen, UserCheck, Calendar, MapPinned, Check, CheckSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

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
  has_training: boolean;
  distance: number;
}

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
    is_premium: false,
    has_training: true,
    distance: 3.2
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
    is_premium: true,
    has_training: true,
    distance: 15.7
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
    is_premium: false,
    has_training: false,
    distance: 8.5
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
    is_premium: true,
    has_training: false,
    distance: 12.3
  }
];

export default function CaregiverMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [onlyTrained, setOnlyTrained] = useState<boolean>(false);

  const careTypeOptions = [
    "Elderly Care", 
    "Child Care", 
    "Special Needs", 
    "Medical Support", 
    "Overnight Care", 
    "Companionship",
    "Housekeeping"
  ];
  
  const availabilityOptions = [
    { value: "all", label: "Any Availability" },
    { value: "immediate", label: "Immediate / ASAP" },
    { value: "scheduled", label: "Scheduled" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "evenings", label: "Evenings" },
    { value: "overnight", label: "Overnight" }
  ];
  
  useEffect(() => {
    const loadCaregivers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real professional users from the database
        const { data: professionalUsers, error: professionalError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'professional');
        
        if (professionalError) {
          console.error("Error fetching professional users:", professionalError);
          toast.error("Failed to load professional caregivers");
        }
        
        // Transform professional users to match Caregiver interface
        const realCaregivers: Caregiver[] = professionalUsers ? professionalUsers.map(prof => {
          // Calculate a random match score between 65-99 for demo purposes
          // In a real app, you would use an algorithm based on preferences
          const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
          
          // Generate a random distance for demo purposes (1-20km)
          // In a real app, you would calculate actual distance
          const distance = parseFloat((Math.random() * 19 + 1).toFixed(1));
          
          // Get first name only for privacy
          const firstName = prof.full_name ? prof.full_name.split(' ')[0] : 'Professional';
          
          return {
            id: prof.id,
            full_name: `${firstName}`, // Only use first name
            avatar_url: prof.avatar_url,
            hourly_rate: prof.hourly_rate || '$15-25',
            location: prof.location || 'Port of Spain',
            years_of_experience: prof.years_of_experience || '1+',
            care_types: prof.care_types || ['Elderly Care'],
            specialized_care: prof.specialized_care || [],
            availability: prof.availability || ['Weekdays'],
            match_score: matchScore,
            is_premium: false,
            has_training: Boolean(prof.has_training || prof.certifications?.length > 0),
            distance: distance
          };
        }) : [];
        
        console.log("Loaded real professional caregivers:", realCaregivers.length);
        
        // Wait a moment to simulate loading (can be removed in production)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update mock caregivers to use first names only
        const privacyProtectedMockCaregivers = MOCK_CAREGIVERS.map(caregiver => {
          const firstName = caregiver.full_name.split(' ')[0];
          return {
            ...caregiver,
            full_name: firstName
          };
        });
        
        // Combine real professionals with mock data, prioritizing real ones
        const allCaregivers = [...realCaregivers, ...privacyProtectedMockCaregivers];
        
        setCaregivers(allCaregivers);
        setFilteredCaregivers(allCaregivers);
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
  }, [user, isProfileComplete, navigate]);
  
  useEffect(() => {
    if (caregivers.length === 0) return;

    const applyFilters = () => {
      let result = [...caregivers];

      if (careTypes.length > 0) {
        result = result.filter(caregiver => 
          caregiver.care_types?.some(type => careTypes.includes(type))
        );
      }

      if (availability !== "all") {
        result = result.filter(caregiver =>
          caregiver.availability?.some(avail => 
            avail.toLowerCase().includes(availability.toLowerCase())
          )
        );
      }

      result = result.filter(caregiver => caregiver.distance <= maxDistance);

      result = result.filter(caregiver => {
        const minPrice = parseInt(caregiver.hourly_rate?.split('-')[0].replace('$', '') || '0');
        const maxPrice = parseInt(caregiver.hourly_rate?.split('-')[1]?.replace('$', '') || minPrice.toString());
        return minPrice <= priceRange[1] && maxPrice >= priceRange[0];
      });

      if (onlyTrained) {
        result = result.filter(caregiver => caregiver.has_training);
      }

      result.sort((a, b) => b.match_score - a.match_score);

      setFilteredCaregivers(result);
    };

    applyFilters();
  }, [caregivers, careTypes, availability, maxDistance, priceRange, onlyTrained]);
  
  const trackEngagement = async (actionType: string, additionalData = {}) => {
    try {
      const sessionId = localStorage.getItem('session_id') || uuidv4();
      
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
  
  const handleUnlockProfile = async (caregiverId: string, isPremium: boolean) => {
    await trackEngagement('unlock_profile_click', { caregiver_id: caregiverId, is_premium: isPremium });
    
    navigate("/subscription-features", { 
      state: { 
        returnPath: "/caregiver-matching",
        featureType: "Premium Caregiver Profiles",
        caregiverId: caregiverId
      } 
    });
  };

  const handleCareTypeChange = (type: string) => {
    setCareTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Caregiver Matches</h1>
        <p className="text-gray-600">
          We've found {filteredCaregivers.length} caregivers that match your profile requirements
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filter & Sort</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Care Type Needed</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {careTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`care-type-${type}`}
                    checked={careTypes.includes(type)}
                    onCheckedChange={() => handleCareTypeChange(type)}
                  />
                  <Label htmlFor={`care-type-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-sm">Caregiver Availability</Label>
                <Select
                  value={availability}
                  onValueChange={setAvailability}
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  <span>Maximum Distance: {maxDistance} km</span>
                </Label>
                <Slider 
                  value={[maxDistance]} 
                  min={1} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => setMaxDistance(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  <span>Price Range: ${priceRange[0]} - ${priceRange[1]}</span>
                </Label>
                <Slider 
                  value={priceRange} 
                  min={0} 
                  max={100} 
                  step={5}
                  onValueChange={(value: number[]) => {
                    setPriceRange([value[0], value[1]] as [number, number]);
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="trained-caregivers" 
                checked={onlyTrained}
                onCheckedChange={(checked) => setOnlyTrained(checked as boolean)}
              />
              <Label htmlFor="trained-caregivers" className="text-sm">Show only platform-trained caregivers</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
              setCareTypes([]);
              setAvailability("all");
              setMaxDistance(30);
              setPriceRange([0, 100]);
              setOnlyTrained(false);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
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
                  navigate("/subscription-features", { 
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
                  
                  <div className="col-span-2 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
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

                      <div className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Distance</div>
                          <div className="font-medium">{caregiver.distance.toFixed(1)} km</div>
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
                            <Calendar className="h-3 w-3" />
                            <span>{avail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Background Checked</span>
                      </div>

                      {caregiver.has_training && (
                        <div className="flex items-center gap-1 mb-2">
                          <Check className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700">Platform Trained</span>
                        </div>
                      )}
                      
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
                        onClick={() => handleUnlockProfile(caregiver.id, caregiver.is_premium)}
                      >
                        Unlock Profile
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
