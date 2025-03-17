import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight, UserCheck, Clock, Filter, Calendar, MapPinned } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

const MOCK_FAMILIES: Family[] = [{
  id: "1",
  full_name: "Garcia Family",
  avatar_url: null,
  location: "Port of Spain",
  care_types: ["Elderly Care", "Companionship"],
  special_needs: ["Alzheimer's", "Mobility Assistance"],
  care_schedule: "Weekdays, Evenings",
  match_score: 95,
  is_premium: false,
  distance: 3.2
}, {
  id: "2",
  full_name: "Wilson Family",
  avatar_url: null,
  location: "San Fernando",
  care_types: ["Special Needs", "Medical Support"],
  special_needs: ["Autism Care", "Medication Management"],
  care_schedule: "Full-time, Weekends",
  match_score: 89,
  is_premium: true,
  distance: 15.7
}, {
  id: "3",
  full_name: "Thomas Family",
  avatar_url: null,
  location: "Arima",
  care_types: ["Child Care", "Housekeeping"],
  special_needs: ["Early Childhood Development", "Meal Preparation"],
  care_schedule: "Part-time, Mornings",
  match_score: 82,
  is_premium: false,
  distance: 8.5
}];

export const DashboardFamilyMatches = () => {
  const {
    user,
    isProfileComplete
  } = useAuth();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(30);

  const careTypeOptions = ["Elderly Care", "Child Care", "Special Needs", "Medical Support", "Overnight Care", "Companionship", "Housekeeping"];
  const specialNeedsOptions = ["Alzheimer's", "Mobility Assistance", "Medication Management", "Autism Care", "Dementia Care", "Meal Preparation"];
  const scheduleOptions = [{
    value: "all",
    label: "Any Schedule"
  }, {
    value: "full-time",
    label: "Full-time"
  }, {
    value: "part-time",
    label: "Part-time"
  }, {
    value: "weekdays",
    label: "Weekdays"
  }, {
    value: "weekends",
    label: "Weekends"
  }, {
    value: "evenings",
    label: "Evenings"
  }, {
    value: "mornings",
    label: "Mornings"
  }, {
    value: "overnight",
    label: "Overnight"
  }];

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setIsLoading(true);

        const {
          data: familyUsers,
          error: familyError
        } = await supabase.from('profiles').select('*').eq('role', 'family');
        if (familyError) {
          console.error("Error fetching family users:", familyError);
        }

        const realFamilies: Family[] = familyUsers ? familyUsers.map(family => {
          const matchScore = Math.floor(Math.random() * (99 - 65) + 65);
          const distance = parseFloat((Math.random() * 19 + 1).toFixed(1));
          return {
            id: family.id,
            full_name: family.full_name || `${family.care_recipient_name || ''} Family`,
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

        const limitedMockFamilies = MOCK_FAMILIES.slice(0, Math.max(0, 3 - realFamilies.length));
        const allFamilies = [...realFamilies, ...limitedMockFamilies].slice(0, 3);

        if (user) {
          await trackEngagement('dashboard_family_matches_view');
        }
        setFamilies(allFamilies);
        setFilteredFamilies(allFamilies);
      } catch (error) {
        console.error("Error loading families:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      loadFamilies();
    }
  }, [user]);

  useEffect(() => {
    if (families.length === 0) return;
    const applyFilters = () => {
      let result = [...families];
      if (careTypes.length > 0) {
        result = result.filter(family => family.care_types?.some(type => careTypes.includes(type)));
      }
      if (specialNeeds.length > 0) {
        result = result.filter(family => family.special_needs?.some(need => specialNeeds.includes(need)));
      }
      if (scheduleType !== "all") {
        result = result.filter(family => family.care_schedule?.toLowerCase().includes(scheduleType.toLowerCase()));
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
      const {
        error
      } = await supabase.from('cta_engagement_tracking').insert({
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

  const handleCareTypeChange = (type: string) => {
    setCareTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSpecialNeedsChange = (need: string) => {
    setSpecialNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);
  };

  const handleUnlockProfile = (familyId: string) => {
    trackEngagement('unlock_family_profile_click', {
      family_id: familyId
    });
    navigate("/subscription-features", {
      state: {
        returnPath: "/family-matching",
        referringPagePath: "/dashboard/professional",
        referringPageLabel: "Professional Dashboard",
        featureType: "Premium Family Profiles",
        familyId: familyId
      }
    });
  };

  if (!user) {
    return null;
  }

  if (!isProfileComplete) {
    return <Card className="mb-8 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl">Complete Your Profile for Family Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Complete your professional profile to see personalized family matches that need your care services.
          </p>
          <Button onClick={() => navigate("/registration/professional", {
          state: {
            returnPath: "/family-matching",
            action: "findFamilies"
          }
        })}>
            Complete Profile
          </Button>
        </CardContent>
      </Card>;
  }

  return <Card className="mb-8 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Family Matches</CardTitle>
          <p className="text-sm text-gray-500">
            {filteredFamilies.length} families match your expertise
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="default" className="flex items-center gap-1" onClick={() => {
          trackEngagement('view_all_family_matches_click');
          navigate("/family-matching", {
            state: {
              referringPagePath: "/dashboard/professional",
              referringPageLabel: "Professional Dashboard"
            }
          });
        }}>
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {showFilters && <CardContent className="border-b pb-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Care Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {careTypeOptions.map(type => <div key={type} className="flex items-center space-x-2">
                  <Checkbox id={`care-type-${type}`} checked={careTypes.includes(type)} onCheckedChange={() => handleCareTypeChange(type)} />
                  <Label htmlFor={`care-type-${type}`} className="text-sm">{type}</Label>
                </div>)}
            </div>
            
            <h3 className="font-medium text-sm">Special Needs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {specialNeedsOptions.map(need => <div key={need} className="flex items-center space-x-2">
                  <Checkbox id={`special-need-${need}`} checked={specialNeeds.includes(need)} onCheckedChange={() => handleSpecialNeedsChange(need)} />
                  <Label htmlFor={`special-need-${need}`} className="text-sm">{need}</Label>
                </div>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-sm">Care Schedule</Label>
                <Select value={scheduleType} onValueChange={setScheduleType}>
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleOptions.map(option => <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  <span>Maximum Distance: {maxDistance} km</span>
                </Label>
                <Slider value={[maxDistance]} min={1} max={50} step={1} onValueChange={value => setMaxDistance(value[0])} />
              </div>
            </div>
          </div>
        </CardContent>}
      
      <CardContent>
        {isLoading ? <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div> : filteredFamilies.length > 0 ? <div className="space-y-4">
            {filteredFamilies.map(family => <div key={family.id} className={`p-4 rounded-lg border ${family.is_premium ? 'border-amber-300' : 'border-gray-200'} relative`}>
                {family.is_premium && <div className="absolute top-0 right-0">
                    <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
                      Premium
                    </Badge>
                  </div>}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col items-center sm:items-start sm:w-1/4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={family.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
                        {family.full_name.split(' ')[0][0] || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-2 text-center sm:text-left">
                      <h3 className="font-semibold">{family.full_name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{family.location}</span>
                      </div>
                      <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
                        <span className="text-sm font-medium text-primary-700">{family.match_score}% Match</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:w-2/4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>{family.care_schedule}</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <MapPinned className="h-3.5 w-3.5 text-gray-500" />
                        <span>{family.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Care Needs:</span>
                      <div className="flex flex-wrap gap-1">
                        {family.care_types?.map((type, i) => <Badge key={i} variant="outline" className="bg-gray-50">
                            {type}
                          </Badge>)}
                      </div>
                    </div>
                    
                    {family.special_needs && family.special_needs.length > 0 && <div className="text-sm">
                        <span className="font-medium block mb-1">Special Needs:</span>
                        <div className="flex flex-wrap gap-1">
                          {family.special_needs?.map((need, i) => <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {need}
                            </Badge>)}
                        </div>
                      </div>}
                  </div>
                  
                  <div className="sm:w-1/4 flex flex-col justify-center space-y-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className="h-4 w-4 text-amber-400"
                        />
                      ))}
                    </div>
                    
                    <Button variant="default" className="w-full" onClick={() => handleUnlockProfile(family.id)}>
                      Unlock Profile
                    </Button>
                  </div>
                </div>
              </div>)}
            
            <Button variant="outline" className="w-full mt-2" onClick={() => {
          trackEngagement('view_all_family_matches_click');
          navigate("/family-matching", {
            state: {
              referringPagePath: "/dashboard/professional",
              referringPageLabel: "Professional Dashboard"
            }
          });
        }}>
              View All Family Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div> : <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No families match your selected filters</p>
            <Button variant="outline" onClick={() => {
          setCareTypes([]);
          setSpecialNeeds([]);
          setScheduleType("all");
          setMaxDistance(30);
        }}>
              Reset Filters
            </Button>
          </div>}
      </CardContent>
    </Card>;
};
