
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, ClipboardList, Users } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { CarePlan, CareTeamMember, CareShift } from "@/types/care-management";
import { format } from "date-fns";

export function CarePlansAccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("care_plans");
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careTeams, setCareTeams] = useState<CareTeamMember[]>([]);
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCarePlansAndTeams = async () => {
      setLoading(true);
      try {
        // Get care teams the professional is part of
        const { data: teamData, error: teamError } = await supabase
          .from('care_team_members')
          .select('*, care_plan:care_plans(*)')
          .eq('caregiver_id', user.id)
          .eq('status', 'active');

        if (teamError) throw teamError;

        // Extract care plan ids
        const careTeamMembers = teamData || [];
        setCareTeams(careTeamMembers);

        // Get care plans from team memberships
        const carePlanIds = careTeamMembers.map(team => team.care_plan_id);
        if (carePlanIds.length > 0) {
          const { data: planData, error: planError } = await supabase
            .from('care_plans')
            .select('*')
            .in('id', carePlanIds);

          if (planError) throw planError;
          setCarePlans(planData || []);

          // Get upcoming shifts for these care plans
          const { data: shiftData, error: shiftError } = await supabase
            .from('care_shifts')
            .select('*')
            .in('care_plan_id', carePlanIds)
            .gt('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(5);

          if (shiftError) throw shiftError;
          setShifts(shiftData || []);
        }
      } catch (error) {
        console.error('Error fetching care plans and teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarePlansAndTeams();
  }, [user]);

  // Helper functions for rendering
  const getCarePlanById = (id: string) => {
    return carePlans.find(plan => plan.id === id);
  };
  
  const getInitials = (name: string = 'User') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatShiftTime = (shift: CareShift) => {
    try {
      const start = new Date(shift.start_time);
      const end = new Date(shift.end_time);
      
      const dateStr = format(start, 'MMM d, yyyy');
      const timeStr = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
      
      return { date: dateStr, time: timeStr };
    } catch (error) {
      console.error('Error formatting shift time:', error);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
          Family Care Plans
        </CardTitle>
        <CardDescription>
          Care plans you have been authorized to access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="care_plans" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="care_plans" className="flex-1">Care Plans</TabsTrigger>
            <TabsTrigger value="upcoming_shifts" className="flex-1">Upcoming Shifts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="care_plans">
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading care plans...
              </div>
            ) : carePlans.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="mb-2">You don't have access to any care plans yet.</p>
                <p className="text-sm text-gray-400">When families add you to their care team, their plans will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {carePlans.map((plan) => (
                  <div key={plan.id} className="flex items-start border-b border-gray-100 pb-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{plan.title}</h3>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {plan.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{plan.description}</p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{
                            careTeams.filter(team => team.care_plan_id === plan.id).length
                          } team members</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Created {new Date(plan.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/dashboard/family/care-plans/${plan.id}/team`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming_shifts">
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading shifts...
              </div>
            ) : shifts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="mb-2">No upcoming shifts scheduled.</p>
                <p className="text-sm text-gray-400">When you are assigned to shifts, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift) => {
                  const { date, time } = formatShiftTime(shift);
                  const plan = getCarePlanById(shift.care_plan_id);
                  
                  return (
                    <div key={shift.id} className="flex items-start border-b border-gray-100 pb-4">
                      <div className="mr-3">
                        <Avatar>
                          {shift.caregiver?.avatar_url ? (
                            <AvatarImage src={shift.caregiver.avatar_url} alt="Caregiver" />
                          ) : (
                            <AvatarFallback>{getInitials(shift.caregiver?.full_name)}</AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-base font-medium">{shift.title}</h3>
                        {plan && <p className="text-sm text-gray-600">{plan.title}</p>}
                        
                        <div className="flex flex-wrap gap-x-3 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{date}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          shift.status === 'confirmed' ? 'default' :
                          shift.status === 'requested' ? 'outline' : 'secondary'
                        }
                      >
                        {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {carePlans.length > 0 && (
          <Button 
            variant={activeTab === 'care_plans' ? 'default' : 'outline'} 
            className="w-full"
            onClick={() => {
              if (carePlans.length > 0) {
                navigate(`/dashboard/family/care-plans/${carePlans[0].id}/team`);
              }
            }}
          >
            {activeTab === 'care_plans' ? 'View Care Plans' : 'View Calendar'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
