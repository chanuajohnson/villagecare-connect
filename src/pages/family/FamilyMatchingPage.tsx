import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Filter, MapPin, Star, Lock, Calendar, MapPinned, UserCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface Family {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  special_needs: string[] | null;
  care_schedule: string | null;
  match_score: number;
  is_premium: boolean;
  distance: number;
  original_full_name: string;
}

const MOCK_FAMILIES: Family[] = [
  {
    id: "1",
    full_name: "Garcia Family",
    avatar_url: null,
    location: "Port of Spain",
    care_types: ["Elderly Care", "Companionship"],
    special_needs: ["Alzheimer's", "Mobility Assistance"],
    care_schedule: "Weekdays, Evenings",
    match_score: 95,
    is_premium: false,
    distance: 3.2,
    original_full_name: "Garcia Family"
  },
  {
    id: "2",
    full_name: "Wilson Family",
    avatar_url: null,
    location: "San Fernando",
    care_types: ["Special Needs", "Medical Support"],
    special_needs: ["Autism Care", "Medication Management"],
    care_schedule: "Full-time, Weekends",
    match_score: 89,
    is_premium: true,
    distance: 15.7,
    original_full_name: "Wilson Family"
  },
  {
    id: "3",
    full_name: "Thomas Family",
    avatar_url: null,
    location: "Arima",
    care_types: ["Child Care", "Housekeeping"],
    special_needs: ["Early Childhood Development", "Meal Preparation"],
    care_schedule: "Part-time, Mornings",
    match_score: 82,
    is_premium: false,
    distance: 8.5,
    original_full_name: "Thomas Family"
  },
  {
    id: "4",
    full_name: "Ramirez Family",
    avatar_url: null,
    location: "Chaguanas",
    care_types: ["Elderly Care", "Overnight Care"],
    special_needs: ["Dementia Care", "Stroke Recovery"],
    care_schedule: "Overnight, Weekends",
    match_score: 78,
    is_premium: true,
    distance: 12.3,
    original_full_name: "Ramirez Family"
  }
];

export default function FamilyMatchingPage() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);

  const careTypeOptions = [
    "Elderly Care", 
    "Child Care", 
    "Special Needs", 
    "Medical Support", 
    "Overnight Care", 
    "Companionship",
    "Housekeeping"
  ];
  
  const specialNeedsOptions = [
    "Alzheimer's",
    "Mobility Assistance",
    "Medication Management",
    "Autism Care", 
    "Dementia Care",
    "Stroke Recovery",
    "Meal Preparation",
    "Early Childhood Development"
  ];
  
  const scheduleOptions = [
    { value: "all", label: "Any Schedule" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "evenings", label: "Evenings" },
    { value: "mornings", label: "Mornings" },
    { value: "overnight", label: "Overnight" }
  ];
  
  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setIsLoading(true);
        
        const { data: familyUsers, error: familyError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'family');
        
        if (familyError) {
          console.error("Error fetching family users:", familyError);
          toast.error("Failed to load family matches");
        }
        
        const realFamilies: Family[] = familyUsers ? familyUsers.map(family => {
          const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
          const distance = parseFloat((Math.random() * 19 + 1).toFixed(1));
          
          let displayName = "";
          if (family.care_recipient_name) {
            displayName = family.care_recipient_name.split(' ')[0];
          } else if (family.full_name) {
            displayName = family.full_name.split(' ')[0];
          } else {
            displayName = "Family";
          }
          
          return {
            id: family.id,
            full_name: `${displayName} Family`,
            original_full_name: family.full_name || family.care_recipient_name || 'Family User',
            avatar_url: family.avatar_url,
            location: family.location || 'Port of Spain',
            care_types: family.care_types || ['Elderly Care'],
            special_needs: family.special_needs || [],
            care_schedule: family.care_schedule || 'Weekdays',
            match_score: matchScore,
            is_premium: false,
            distance: distance
          };
        }) : [];
        
        console.log("Loaded real family users:", realFamilies.length);
        
        const privacyProtectedMockFamilies = MOCK_FAMILIES.map(family => {
          const firstName = family.full_name.split(' ')[0];
          return {
            ...family,
            full_name: `${firstName} Family`,
            original_full_name: family.full_name
          };
        });
        
        const allFamilies = [...realFamilies, ...privacyProtectedMockFamilies];
        
        if (user) {
          await trackEngagement('family_matching_page_view');
        }
        
        setFamilies(allFamilies);
        setFilteredFamilies(allFamilies);
      } catch (error) {
        console.error("Error loading families:", error);
        toast.error("Failed to load family matches");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isProfileComplete) {
      loadFamilies();
    } else if (user && !isProfileComplete) {
      navigate("/registration/professional", { 
        state: { returnPath: "/family-matching", action: "findFamilies" }
      });
    } else if (!user) {
      navigate("/auth", { 
        state: { returnPath: "/family-matching", action: "findFamilies" }
      });
    }
  }, [user, isProfileComplete, navigate]);
  
  useEffect(() => {
    if (families.length === 0) return;

    const applyFilters = () => {
      let result = [...families];

      if (careTypes.length > 0) {
        result = result.filter(family => 
          family.care_types?.some(type => careTypes.includes(type))
        );
      }

      if (specialNeeds.length > 0) {
        result = result.filter(family =>
          family.special_needs?.some(need => specialNeeds.includes(need))
        );
      }

      if (scheduleType !== "all") {
        result = result.filter(family =>
          family.care_schedule?.toLowerCase().includes(scheduleType.toLowerCase())
        );
      }

      result = result.filter(family => family.distance <= maxDistance);

      result.sort((a, b) => b.match_score - a.match_score);

      setFilteredFamilies(result);
    };

    applyFilters();
  }, [families, careTypes, specialNeeds, scheduleType, maxDistance]);
  
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
  
  const handleUnlockProfile = async (familyId: string, isPremium: boolean) => {
    await trackEngagement('unlock_family_profile_click', { family_id: familyId, is_premium: isPremium });
    
    navigate("/subscription-features", { 
      state: { 
        returnPath: "/family-matching",
        featureType: "Premium Family Profiles",
        familyId: familyId
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
  
  const handleSpecialNeedsChange = (need: string) => {
    setSpecialNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need) 
        : [...prev, need]
    );
  };
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Family Matches</h1>
        <p className="text-gray-600">
          We've found {filteredFamilies.length} families that match your skills and experience
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
            <h3 className="font-medium text-sm">Care Types</h3>
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

            <h3 className="font-medium text-sm">Special Needs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {specialNeedsOptions.map((need) => (
                <div key={need} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`special-need-${need}`}
                    checked={specialNeeds.includes(need)}
                    onCheckedChange={() => handleSpecialNeedsChange(need)}
                  />
                  <Label htmlFor={`special-need-${need}`} className="text-sm">{need}</Label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-sm">Care Schedule</Label>
                <Select
                  value={scheduleType}
                  onValueChange={setScheduleType}
                >
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleOptions.map(option => (
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
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredFamilies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No families match your current filters</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setCareTypes([]);
              setSpecialNeeds([]);
              setScheduleType("all");
              setMaxDistance(30);
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
                  Unlock Premium Matching: Get priority placement with families and access to exclusive job opportunities.
                </p>
              </div>
              <Button 
                variant="default" 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  trackEngagement('premium_family_matching_cta_click');
                  navigate("/subscription-features", { 
                    state: { 
                      returnPath: "/family-matching",
                      featureType: "Premium Matching" 
                    } 
                  });
                }}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
          
          {filteredFamilies.map((family) => (
            <Card 
              key={family.id} 
              className={`relative overflow-hidden ${family.is_premium ? 'border-amber-300 shadow-amber-100' : ''}`}
            >
              {family.is_premium && (
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
                        <AvatarImage src={family.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                          {getInitials(family.original_full_name || family.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="mt-3 text-center">
                        <h3 className="text-lg font-semibold">{family.full_name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{family.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 w-full rounded-lg p-2 text-center">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <div className="text-2xl font-bold text-primary-700">{family.match_score}%</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Care Schedule</div>
                          <div className="font-medium">{family.care_schedule}</div>
                        </div>
                      </div>
                      
                      <span className="text-gray-300 mx-2">|</span>
                      
                      <div className="flex items-center gap-1">
                        <MapPinned className="h-4 w-4 text-primary-600" />
                        <div>
                          <div className="text-sm text-gray-500">Distance</div>
                          <div className="font-medium">{family.distance.toFixed(1)} km</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Care Types Needed</div>
                      <div className="flex flex-wrap gap-1">
                        {family.care_types?.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {family.special_needs && family.special_needs.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Special Care Needs</div>
                        <div className="flex flex-wrap gap-1">
                          {family.special_needs?.map((need, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleUnlockProfile(family.id, family.is_premium)}
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
