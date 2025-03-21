
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, ChevronRight, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchSharedCarePlans } from "@/services/care-plan-service";
import { fetchCareShiftsByCaregiver, requestShift } from "@/services/care-shift-service";
import { CarePlan, CareShift } from "@/types/care-management";
import { format, isAfter } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function CarePlansAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("shared-plans");

  // Fetch shared care plans
  const { 
    data: sharedPlans = [], 
    isLoading: isLoadingPlans 
  } = useQuery({
    queryKey: ['sharedCarePlans', user?.id],
    queryFn: () => (user?.id ? fetchSharedCarePlans(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // Fetch care shifts
  const { 
    data: careShifts = [], 
    isLoading: isLoadingShifts 
  } = useQuery({
    queryKey: ['caregiverShifts', user?.id],
    queryFn: () => (user?.id ? fetchCareShiftsByCaregiver(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // Request shift mutation
  const requestShiftMutation = useMutation({
    mutationFn: ({ shiftId, caregiverId }: { shiftId: string, caregiverId: string }) => 
      requestShift(shiftId, caregiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiverShifts'] });
      toast.success('Shift requested successfully!');
    },
    onError: () => {
      toast.error('Failed to request shift. Please try again.');
    }
  });

  // Filter open shifts that are in the future
  const openShifts = careShifts.filter(
    shift => shift.status === 'open' && isAfter(new Date(shift.start_time), new Date())
  );

  // Filter shifts assigned to this caregiver
  const myShifts = careShifts.filter(
    shift => shift.caregiver_id === user?.id && isAfter(new Date(shift.start_time), new Date())
  );

  // Format date
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  // Request a shift
  const handleRequestShift = (shiftId: string) => {
    if (user?.id) {
      requestShiftMutation.mutate({ shiftId, caregiverId: user.id });
    }
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-100 text-green-800";
      case 'requested':
        return "bg-yellow-100 text-yellow-800";
      case 'open':
        return "bg-blue-100 text-blue-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="h-6 w-6 mr-2 text-blue-600" />
          Care Plans & Shifts
        </CardTitle>
        <CardDescription>
          View assigned care plans and available shifts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="shared-plans">Shared Plans</TabsTrigger>
            <TabsTrigger value="shifts">Available Shifts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shared-plans">
            {isLoadingPlans ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : sharedPlans.length > 0 ? (
              <div className="space-y-3">
                {sharedPlans.map((plan: CarePlan) => (
                  <div key={plan.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{plan.title}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {formatDate(plan.created_at)}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <UsersRound className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium">No Shared Plans</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No families have shared care plans with you yet.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="shifts">
            <div className="space-y-4">
              {myShifts.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">My Upcoming Shifts</h3>
                  <div className="space-y-3">
                    {myShifts.map((shift: CareShift) => (
                      <div key={shift.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{shift.title}</h4>
                            <p className="text-sm text-gray-700">
                              {formatDate(shift.start_time)}
                              {" "}
                              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                            </p>
                            {shift.location && (
                              <p className="text-xs text-gray-500 mt-1">
                                {shift.location}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className={getStatusBadge(shift.status)}>
                            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {openShifts.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Available Shifts</h3>
                  <div className="space-y-3">
                    {openShifts.map((shift: CareShift) => (
                      <div key={shift.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{shift.title}</h4>
                            <p className="text-sm text-gray-700">
                              {formatDate(shift.start_time)}
                              {" "}
                              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                            </p>
                            {shift.location && (
                              <p className="text-xs text-gray-500 mt-1">
                                Location: {shift.location}
                              </p>
                            )}
                            {shift.family && (
                              <div className="flex items-center mt-2">
                                <Avatar className="h-5 w-5 mr-1">
                                  <AvatarImage src={shift.family.avatar_url} />
                                  <AvatarFallback>
                                    {shift.family.full_name?.charAt(0) || "F"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{shift.family.full_name}</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleRequestShift(shift.id)}
                            disabled={requestShiftMutation.isPending}
                          >
                            Request
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {openShifts.length === 0 && myShifts.length === 0 && (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium">No Available Shifts</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    There are no open shifts available for you at this time.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => navigate("/dashboard/professional/schedule")} className="w-full">
          View Full Schedule
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
