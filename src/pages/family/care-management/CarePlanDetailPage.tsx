
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { ArrowLeft, Calendar, Clock, FileText, Plus, Users, X, Check, Edit2, ArrowRight } from "lucide-react";
import { fetchCarePlan, fetchCareTeamMembers, inviteCareTeamMember, createCareShift, fetchCareShifts, CareTeamMember, CarePlan, CareShift } from "@/services/care-plan-service";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { format, parse, startOfWeek, endOfWeek, addDays, isToday, addHours, isAfter } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Professional {
  id: string;
  full_name: string | null;
  professional_type: string | null;
  avatar_url: string | null;
}

interface CareTeamMemberWithProfile extends CareTeamMember {
  professionalDetails?: Professional;
}

interface ShiftForm {
  careTeamMemberId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  recurring: boolean;
  recurrencePattern: string;
}

const TODAY = new Date();
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHIFT_TYPES = {
  morning: { label: 'Morning Shift', hours: '6:00 AM - 2:00 PM' },
  afternoon: { label: 'Afternoon Shift', hours: '2:00 PM - 10:00 PM' },
  overnight: { label: 'Overnight Shift', hours: '10:00 PM - 6:00 AM' },
  custom: { label: 'Custom Shift', hours: '' }
};

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(TODAY, { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(TODAY);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [shiftType, setShiftType] = useState('custom');
  const [newTeamMember, setNewTeamMember] = useState({
    caregiverId: "",
    role: "caregiver" as const,
    notes: ""
  });
  const [newShift, setNewShift] = useState<ShiftForm>({
    careTeamMemberId: "",
    title: "Care Visit",
    description: "",
    startTime: format(new Date().setHours(9, 0, 0, 0), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date().setHours(17, 0, 0, 0), "yyyy-MM-dd'T'HH:mm"),
    location: "",
    recurring: false,
    recurrencePattern: "weekly"
  });

  // Get the week days for the current week view
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (user && id) {
      loadCarePlan();
      loadCareTeamMembers();
      loadCareShifts();
      loadProfessionals();
    } else {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    if (id) {
      loadCareShifts();
    }
  }, [weekStart]);

  useEffect(() => {
    // Set default shift times based on the selected shift type
    if (shiftType !== 'custom' && selectedDate) {
      const baseDate = format(selectedDate, 'yyyy-MM-dd');
      
      switch(shiftType) {
        case 'morning':
          setNewShift({
            ...newShift,
            title: 'Morning Care',
            startTime: `${baseDate}T06:00`,
            endTime: `${baseDate}T14:00`
          });
          break;
        case 'afternoon':
          setNewShift({
            ...newShift,
            title: 'Afternoon Care',
            startTime: `${baseDate}T14:00`,
            endTime: `${baseDate}T22:00`
          });
          break;
        case 'overnight':
          setNewShift({
            ...newShift,
            title: 'Overnight Care',
            startTime: `${baseDate}T22:00`,
            endTime: `${format(addDays(selectedDate, 1), 'yyyy-MM-dd')}T06:00`
          });
          break;
      }
    }
  }, [shiftType, selectedDate]);

  const loadCarePlan = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const plan = await fetchCarePlan(id);
      if (plan) {
        setCarePlan(plan);
      } else {
        toast.error("Care plan not found");
        navigate("/family/care-management");
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      toast.error("Failed to load care plan details");
    } finally {
      setLoading(false);
    }
  };

  const loadCareTeamMembers = async () => {
    if (!id) return;

    try {
      const members = await fetchCareTeamMembers(id);
      
      const membersWithDetails = await Promise.all(members.map(async (member) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, professional_type, avatar_url')
          .eq('id', member.caregiver_id)
          .single();
        
        return {
          ...member,
          professionalDetails: error ? undefined : data
        };
      }));
      
      setCareTeamMembers(membersWithDetails);
    } catch (error) {
      console.error("Error loading care team members:", error);
      toast.error("Failed to load care team members");
    }
  };

  const loadCareShifts = async () => {
    if (!id) return;

    try {
      setShiftsLoading(true);
      const start = format(weekStart, 'yyyy-MM-dd');
      const end = format(endOfWeek(weekStart, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      
      const shifts = await fetchCareShifts(id, start, end);
      setCareShifts(shifts);
    } catch (error) {
      console.error("Error loading care shifts:", error);
      toast.error("Failed to load care shifts");
    } finally {
      setShiftsLoading(false);
    }
  };

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, professional_type, avatar_url')
        .eq('role', 'professional');

      if (error) {
        throw error;
      }

      setProfessionals(data || []);
    } catch (error) {
      console.error("Error loading professionals:", error);
      toast.error("Failed to load available professionals");
    }
  };

  const handleInviteTeamMember = async () => {
    if (!id || !user) return;

    try {
      if (!newTeamMember.caregiverId) {
        toast.error("Please select a professional to assign");
        return;
      }

      await inviteCareTeamMember({
        care_plan_id: id,
        family_id: user.id,
        caregiver_id: newTeamMember.caregiverId,
        role: newTeamMember.role,
        status: 'active',
        notes: newTeamMember.notes
      });

      toast.success("Team member assigned successfully");
      setInviteDialogOpen(false);
      
      setNewTeamMember({
        caregiverId: "",
        role: "caregiver",
        notes: ""
      });
      
      loadCareTeamMembers();
    } catch (error) {
      console.error("Error assigning team member:", error);
      toast.error("Failed to assign team member");
    }
  };

  const handleCreateShift = async () => {
    if (!id || !user || !selectedDate) return;

    try {
      if (!newShift.careTeamMemberId) {
        toast.error("Please select a care team member");
        return;
      }

      const selectedMember = careTeamMembers.find(m => m.id === newShift.careTeamMemberId);
      if (!selectedMember) {
        toast.error("Invalid team member selected");
        return;
      }

      const startTime = new Date(newShift.startTime);
      const endTime = new Date(newShift.endTime);

      if (isAfter(startTime, endTime)) {
        toast.error("Start time must be before end time");
        return;
      }

      const careShift = {
        care_plan_id: id,
        family_id: user.id,
        caregiver_id: selectedMember.caregiver_id,
        title: newShift.title,
        description: newShift.description,
        location: newShift.location || "Client's home",
        status: "open" as "open" | "assigned" | "completed" | "cancelled",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        recurring_pattern: newShift.recurring ? newShift.recurrencePattern : null
      };

      await createCareShift(careShift);
      
      toast.success("Care shift created successfully");
      setShiftDialogOpen(false);
      
      // Reset form
      setNewShift({
        careTeamMemberId: "",
        title: "Care Visit",
        description: "",
        startTime: format(new Date().setHours(9, 0, 0, 0), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date().setHours(17, 0, 0, 0), "yyyy-MM-dd'T'HH:mm"),
        location: "",
        recurring: false,
        recurrencePattern: "weekly"
      });
      
      loadCareShifts();
    } catch (error) {
      console.error("Error creating care shift:", error);
      toast.error("Failed to create care shift");
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekStart(prevWeekStart => {
      const days = direction === 'next' ? 7 : -7;
      return addDays(prevWeekStart, days);
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (careTeamMembers.length > 0) {
      setShiftDialogOpen(true);
      
      // Set the start/end time for the selected date
      const baseDate = format(date, 'yyyy-MM-dd');
      setNewShift(prev => ({
        ...prev,
        startTime: `${baseDate}T09:00`,
        endTime: `${baseDate}T17:00`
      }));
    } else {
      toast.info("Add team members before scheduling shifts");
      setInviteDialogOpen(true);
    }
  };

  const getShiftsForDay = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return careShifts.filter(shift => {
      const shiftDate = format(new Date(shift.start_time), 'yyyy-MM-dd');
      return shiftDate === dateString;
    });
  };

  const getTeamMemberName = (caregiverId: string) => {
    const member = careTeamMembers.find(m => m.caregiver_id === caregiverId);
    if (member?.professionalDetails?.full_name) {
      return member.professionalDetails.full_name;
    }
    return "Unknown";
  };

  const getPlanTypeDisplay = (plan: CarePlan) => {
    if (!plan.metadata?.plan_type) return "Not specified";
    
    switch (plan.metadata.plan_type) {
      case 'scheduled':
        return "Scheduled Care";
      case 'on-demand':
        return "On-demand Care";
      case 'both':
        return "Scheduled & On-demand";
      default:
        return "Not specified";
    }
  };

  const getInitials = (name: string | null | undefined, id: string): string => {
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return id.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (!carePlan) {
    return (
      <Container className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Care Plan Not Found</CardTitle>
            <CardDescription>
              The requested care plan could not be found.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/family/care-management")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Management
            </Button>
          </CardFooter>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_care_plan_view" additionalData={{ plan_id: id }} />
      
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/family/care-management")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Care Plans
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{carePlan.title}</h1>
              <p className="text-muted-foreground mt-1">
                {carePlan.description || "No description provided"}
              </p>
            </div>
            
            <Badge className={`${
              carePlan.status === 'active' ? 'bg-green-100 text-green-800' :
              carePlan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="team">Care Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Care Plan Details</CardTitle>
                <CardDescription>
                  Information about this care plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Plan Type</h3>
                    <p className="font-medium">{getPlanTypeDisplay(carePlan)}</p>
                  </div>
                  
                  {carePlan.metadata?.plan_type !== 'on-demand' && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekday Coverage</h3>
                      <p className="font-medium">{carePlan.metadata?.weekday_coverage || "None"}</p>
                    </div>
                  )}
                  
                  {carePlan.metadata?.plan_type !== 'on-demand' && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekend Coverage</h3>
                      <p className="font-medium">{carePlan.metadata?.weekend_coverage === 'yes' ? "6AM-6PM" : "None"}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Created On</h3>
                    <p className="font-medium">{new Date(carePlan.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
                    <p className="font-medium">{new Date(carePlan.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {carePlan.metadata?.additional_shifts && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Shifts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {carePlan.metadata.additional_shifts.weekdayEvening && (
                        <Badge variant="outline" className="justify-start">Weekday Evening (4PM-10PM)</Badge>
                      )}
                      {carePlan.metadata.additional_shifts.weekdayOvernight && (
                        <Badge variant="outline" className="justify-start">Weekday Overnight (10PM-6AM)</Badge>
                      )}
                      {carePlan.metadata.additional_shifts.weekendEvening && (
                        <Badge variant="outline" className="justify-start">Weekend Evening (6PM-10PM)</Badge>
                      )}
                      {carePlan.metadata.additional_shifts.weekendOvernight && (
                        <Badge variant="outline" className="justify-start">Weekend Overnight (10PM-6AM)</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Care Team Members</h2>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Care Professional</DialogTitle>
                    <DialogDescription>
                      Add a care professional to this care plan. They will be assigned immediately.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="caregiver">Care Professional</Label>
                      <Select 
                        value={newTeamMember.caregiverId} 
                        onValueChange={(value) => setNewTeamMember({...newTeamMember, caregiverId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a professional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.full_name || prof.id} {prof.professional_type ? `(${prof.professional_type})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={newTeamMember.role} 
                        onValueChange={(value: any) => setNewTeamMember({...newTeamMember, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caregiver">Caregiver</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="therapist">Therapist</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Add any specific notes or instructions for this team member"
                        value={newTeamMember.notes}
                        onChange={(e) => setNewTeamMember({...newTeamMember, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInviteTeamMember}>Assign Professional</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {careTeamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careTeamMembers.map((member) => {
                  const initials = getInitials(member.professionalDetails?.full_name, member.caregiver_id);
                  const displayName = member.professionalDetails?.full_name || member.caregiver_id;
                  const profType = member.professionalDetails?.professional_type;
                  
                  return (
                    <Card key={member.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={member.professionalDetails?.avatar_url || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{displayName}</CardTitle>
                              <CardDescription>
                                {profType ? `${profType} (${member.role})` : 
                                  member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={`${
                            member.status === 'active' ? 'bg-green-100 text-green-800' :
                            member.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                            member.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      {member.notes && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{member.notes}</p>
                        </CardContent>
                      )}
                      <CardFooter className="border-t pt-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Added {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  )}
                )}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>No Team Members</CardTitle>
                  <CardDescription>
                    You haven't added any care professionals to this care plan yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add your first team member to start assigning shifts and tasks.</p>
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Team Member
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:items-center">
                <div>
                  <CardTitle>Care Schedule</CardTitle>
                  <CardDescription>
                    Manage care shifts and appointments
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {careTeamMembers.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day, index) => (
                        <div key={index} className="flex flex-col items-center p-1">
                          <span className="text-xs text-muted-foreground">{DAYS_OF_WEEK[day.getDay()].substring(0, 3)}</span>
                          <button
                            onClick={() => handleDateClick(day)}
                            className={`rounded-full w-8 h-8 flex items-center justify-center text-sm mt-1
                              ${isToday(day) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                              ${format(day, 'yyyy-MM-dd') === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '') ? 'ring-2 ring-primary' : ''}
                            `}
                          >
                            {format(day, 'd')}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 mt-6">
                      {weekDays.map((day, dayIndex) => {
                        const shiftsForDay = getShiftsForDay(day);
                        if (shiftsForDay.length === 0) return null;
                        
                        return (
                          <div key={dayIndex} className="border rounded-lg p-4">
                            <h3 className="font-medium mb-3 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {format(day, 'EEEE, MMMM d, yyyy')}
                              {isToday(day) && <Badge className="ml-2 bg-blue-100 text-blue-800">Today</Badge>}
                            </h3>
                            
                            <div className="space-y-3">
                              {shiftsForDay.map((shift) => (
                                <div key={shift.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                  <div className="flex items-center">
                                    <div className="mr-3 flex-shrink-0">
                                      <Clock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">{shift.title}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                                      </p>
                                      <p className="text-xs mt-1">
                                        {getTeamMemberName(shift.caregiver_id)}
                                      </p>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Check className="mr-2 h-4 w-4" /> Mark Complete
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <X className="mr-2 h-4 w-4" /> Cancel Shift
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {!careShifts.length && (
                        <div className="text-center py-8 border rounded-lg">
                          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium mb-2">No shifts scheduled</h3>
                          <p className="text-muted-foreground mb-4">Click on a date to add a new care shift</p>
                        </div>
                      )}
                    </div>
                    
                    <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Schedule Care Shift</DialogTitle>
                          <DialogDescription>
                            {selectedDate && `Create a new shift for ${format(selectedDate, 'MMMM d, yyyy')}`}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                              <Label>Shift Type</Label>
                              <Select 
                                value={shiftType} 
                                onValueChange={setShiftType}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select shift type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">{SHIFT_TYPES.morning.label} ({SHIFT_TYPES.morning.hours})</SelectItem>
                                  <SelectItem value="afternoon">{SHIFT_TYPES.afternoon.label} ({SHIFT_TYPES.afternoon.hours})</SelectItem>
                                  <SelectItem value="overnight">{SHIFT_TYPES.overnight.label} ({SHIFT_TYPES.overnight.hours})</SelectItem>
                                  <SelectItem value="custom">Custom Shift</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="caregiver">Assign To</Label>
                              <Select 
                                value={newShift.careTeamMemberId} 
                                onValueChange={(value) => setNewShift({...newShift, careTeamMemberId: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select care team member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {careTeamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.professionalDetails?.full_name || member.caregiver_id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="title">Shift Title</Label>
                              <Input
                                id="title"
                                value={newShift.title}
                                onChange={(e) => setNewShift({...newShift, title: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="startTime">Start Time</Label>
                              <Input
                                id="startTime"
                                type="datetime-local"
                                value={newShift.startTime}
                                onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="endTime">End Time</Label>
                              <Input
                                id="endTime"
                                type="datetime-local"
                                value={newShift.endTime}
                                onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                placeholder="Client's home"
                                value={newShift.location}
                                onChange={(e) => setNewShift({...newShift, location: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="description">Notes (Optional)</Label>
                              <Textarea 
                                id="description"
                                placeholder="Add any specific instructions for this shift"
                                value={newShift.description}
                                onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleCreateShift}>Create Shift</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium mb-1">Add team members first</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Before scheduling shifts, you need to add care professionals to your team.
                    </p>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default CarePlanDetailPage;
