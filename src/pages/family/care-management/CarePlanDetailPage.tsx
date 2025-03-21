
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { 
  ArrowLeft, Calendar, Clock, FileText, Plus, Users, ArrowRight, X, Edit, 
  Trash2, MoreHorizontal, UserMinus, CalendarRange, ChevronDown, Save, Pencil
} from "lucide-react";
import { 
  fetchCarePlan, 
  fetchCareTeamMembers, 
  inviteCareTeamMember,
  removeCareTeamMember,
  updateCarePlan,
  CareTeamMember, 
  CarePlan,
  fetchCareShifts,
  createCareShift,
  updateCareShift,
  deleteCareShift,
  CareShift
} from "@/services/care-plan-service";
import { 
  format, addDays, startOfWeek, parse, isSameDay, parseISO, addWeeks, 
  isWithinInterval, endOfDay, startOfDay, subWeeks
} from "date-fns";
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
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface Professional {
  id: string;
  full_name: string | null;
  professional_type: string | null;
  avatar_url: string | null;
}

interface CareTeamMemberWithProfile extends CareTeamMember {
  professionalDetails?: Professional;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SHIFT_TITLE_OPTIONS = [
  { id: "weekday_standard", label: "Monday - Friday, 8 AM - 4 PM", description: "Standard daytime coverage during business hours", timeRange: { start: "08:00", end: "16:00" } },
  { id: "weekday_extended", label: "Monday - Friday, 6 AM - 6 PM", description: "Extended daytime coverage for more comprehensive care", timeRange: { start: "06:00", end: "18:00" } },
  { id: "weekday_night", label: "Monday - Friday, 6 PM - 8 AM", description: "Extended nighttime coverage to relieve standard daytime coverage", timeRange: { start: "18:00", end: "08:00" } },
  { id: "saturday_sunday", label: "Saturday - Sunday, 6 AM - 6 PM", description: "Daytime weekend coverage with a dedicated caregiver", timeRange: { start: "06:00", end: "18:00" } },
  { id: "weekday_evening_4pm_6am", label: "Weekday Evening Shift (4 PM - 6 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "16:00", end: "06:00" } },
  { id: "weekday_evening_4pm_8am", label: "Weekday Evening Shift (4 PM - 8 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "16:00", end: "08:00" } },
  { id: "weekday_evening_6pm_6am", label: "Weekday Evening Shift (6 PM - 6 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "18:00", end: "06:00" } },
  { id: "weekday_evening_6pm_8am", label: "Weekday Evening Shift (6 PM - 8 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "18:00", end: "08:00" } }
];

const TIME_SLOTS = [
  { label: "Morning (6AM-12PM)", value: "morning", time: { start: "06:00", end: "12:00" } },
  { label: "Afternoon (12PM-6PM)", value: "afternoon", time: { start: "12:00", end: "18:00" } },
  { label: "Evening (6PM-10PM)", value: "evening", time: { start: "18:00", end: "22:00" } },
  { label: "Overnight (10PM-6AM)", value: "overnight", time: { start: "22:00", end: "06:00" } }
];

type PlanType = 'scheduled' | 'on-demand' | 'both';
type WeekdayOption = '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
type WeekendOption = 'yes' | 'no';

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [newTeamMember, setNewTeamMember] = useState({
    caregiverId: "",
    role: "caregiver" as const,
    notes: ""
  });
  const [newShift, setNewShift] = useState({
    caregiverId: "",
    title: "",
    selectedShiftType: "",
    description: "",
    day: "",
    timeSlot: "",
    recurring: "no",
    location: ""
  });
  const [editingShift, setEditingShift] = useState<CareShift | null>(null);
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CareTeamMemberWithProfile | null>(null);
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  // Add states for editing care plan
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCarePlan, setEditedCarePlan] = useState<{
    title: string;
    description: string;
    planType: PlanType;
    weekdayOption: WeekdayOption;
    weekendOption: WeekendOption;
    additionalShifts: {
      weekdayEvening4pmTo6am: boolean;
      weekdayEvening4pmTo8am: boolean;
      weekdayEvening6pmTo6am: boolean;
      weekdayEvening6pmTo8am: boolean;
    }
  }>({
    title: "",
    description: "",
    planType: "scheduled",
    weekdayOption: "8am-4pm",
    weekendOption: "yes",
    additionalShifts: {
      weekdayEvening4pmTo6am: false,
      weekdayEvening4pmTo8am: false,
      weekdayEvening6pmTo6am: false,
      weekdayEvening6pmTo8am: false
    }
  });

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

  // Initialize edit form when care plan loads
  useEffect(() => {
    if (carePlan) {
      setEditedCarePlan({
        title: carePlan.title,
        description: carePlan.description || "",
        planType: carePlan.metadata?.plan_type || "scheduled",
        weekdayOption: carePlan.metadata?.weekday_coverage || "8am-4pm",
        weekendOption: carePlan.metadata?.weekend_coverage || "yes",
        additionalShifts: {
          weekdayEvening4pmTo6am: carePlan.metadata?.additional_shifts?.weekdayEvening4pmTo6am || false,
          weekdayEvening4pmTo8am: carePlan.metadata?.additional_shifts?.weekdayEvening4pmTo8am || false,
          weekdayEvening6pmTo6am: carePlan.metadata?.additional_shifts?.weekdayEvening6pmTo6am || false,
          weekdayEvening6pmTo8am: carePlan.metadata?.additional_shifts?.weekdayEvening6pmTo8am || false
        }
      });
    }
  }, [carePlan]);

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
      const shifts = await fetchCareShifts(id);
      setCareShifts(shifts);
    } catch (error) {
      console.error("Error loading care shifts:", error);
      toast.error("Failed to load care shifts");
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

  const handleRemoveTeamMember = async () => {
    if (!memberToRemove) return;

    try {
      const success = await removeCareTeamMember(memberToRemove.id);
      if (success) {
        loadCareTeamMembers();
        toast.success("Team member removed successfully");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    } finally {
      setConfirmRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleCreateShift = async () => {
    if (!id || !user) return;
    
    try {
      const baseDayDate = selectedDay || (dateRange?.from ? new Date(dateRange.from) : new Date());
      
      const selectedShiftType = SHIFT_TITLE_OPTIONS.find(option => option.id === newShift.selectedShiftType);
      
      if (!selectedShiftType) {
        toast.error("Please select a valid shift type");
        return;
      }

      const datesToCreateShifts = [];
      
      if (isRangeSelection && dateRange?.from && dateRange.to) {
        let currentDate = new Date(dateRange.from);
        const endDate = new Date(dateRange.to);
        
        while (currentDate <= endDate) {
          datesToCreateShifts.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        datesToCreateShifts.push(baseDayDate);
      }
      
      for (const shiftDate of datesToCreateShifts) {
        const shiftTitle = selectedShiftType.label;
        
        const [startHour, startMinute] = selectedShiftType.timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = selectedShiftType.timeRange.end.split(':').map(Number);
        
        const startTime = new Date(shiftDate);
        startTime.setHours(startHour, startMinute, 0);
        
        const endTime = new Date(shiftDate);
        if (endHour < startHour) {
          endTime.setDate(endTime.getDate() + 1);
        }
        endTime.setHours(endHour, endMinute, 0);

        const shiftData = {
          care_plan_id: id,
          family_id: user.id,
          caregiver_id: newShift.caregiverId !== "unassigned" ? newShift.caregiverId : undefined,
          title: shiftTitle,
          description: selectedShiftType.description,
          location: "Patient's home",
          status: "open" as "open" | "assigned" | "completed" | "cancelled",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          recurring_pattern: undefined
        };

        if (editingShift && !isRangeSelection) {
          await updateCareShift(editingShift.id, shiftData);
        } else {
          await createCareShift(shiftData);
        }
      }

      toast.success(isRangeSelection ? 
        "Care shifts created for selected date range" : 
        (editingShift ? "Care shift updated" : "Care shift created")
      );
      
      setShiftDialogOpen(false);
      setNewShift({
        caregiverId: "",
        title: "",
        selectedShiftType: "",
        description: "",
        day: "",
        timeSlot: "",
        recurring: "no",
        location: ""
      });
      setEditingShift(null);
      setDateRange({ from: undefined, to: undefined });
      setIsRangeSelection(false);
      loadCareShifts();
    } catch (error) {
      console.error("Error creating/updating care shift:", error);
      toast.error("Failed to save care shift");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this shift?");
      if (confirmed) {
        await deleteCareShift(shiftId);
        loadCareShifts();
      }
    } catch (error) {
      console.error("Error deleting care shift:", error);
      toast.error("Failed to delete care shift");
    }
  };

  const handleEditShift = (shift: CareShift) => {
    const shiftDate = new Date(shift.start_time);
    
    const matchingShiftType = SHIFT_TITLE_OPTIONS.find(option => 
      option.label === shift.title
    ) || SHIFT_TITLE_OPTIONS[0];
    
    setSelectedDay(shiftDate);
    setNewShift({
      caregiverId: shift.caregiver_id || "",
      title: shift.title,
      selectedShiftType: matchingShiftType.id,
      description: shift.description || "",
      day: format(shiftDate, "yyyy-MM-dd"),
      timeSlot: "",
      recurring: "no",
      location: shift.location || ""
    });
    setEditingShift(shift);
    setIsRangeSelection(false);
    setDateRange({ from: undefined, to: undefined });
    setShiftDialogOpen(true);
  };

  const openNewShiftDialog = (day: Date) => {
    setSelectedDay(day);
    setNewShift({
      ...newShift,
      day: format(day, "yyyy-MM-dd"),
    });
    setEditingShift(null);
    setIsRangeSelection(false);
    setDateRange({ from: undefined, to: undefined });
    setShiftDialogOpen(true);
  };

  const getWeekDays = () => {
    return DAYS_OF_WEEK.map((_, index) => {
      const day = addDays(selectedWeek, index);
      return day;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => {
      return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
    });
  };

  const getShiftsForDay = (day: Date) => {
    return careShifts.filter(shift => {
      const shiftDate = new Date(shift.start_time);
      return isSameDay(shiftDate, day);
    });
  };

  const getCaregiverName = (caregiverId?: string) => {
    if (!caregiverId) return "Unassigned";
    
    const member = careTeamMembers.find(m => m.caregiver_id === caregiverId);
    return member?.professionalDetails?.full_name || "Unknown";
  };

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
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

  // Add new function to handle care plan editing
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Add new function to handle saving edited care plan
  const saveCarePlanChanges = async () => {
    if (!id || !user) return;

    try {
      // Prepare plan updates with edited values
      const planUpdates = {
        title: editedCarePlan.title,
        description: editedCarePlan.description,
        metadata: {
          plan_type: editedCarePlan.planType,
          weekday_coverage: editedCarePlan.weekdayOption,
          weekend_coverage: editedCarePlan.weekendOption,
          additional_shifts: editedCarePlan.additionalShifts
        }
      };

      const updatedPlan = await updateCarePlan(id, planUpdates);
      
      if (updatedPlan) {
        setCarePlan(updatedPlan);
        setIsEditMode(false);
        toast.success("Care plan updated successfully");
      }
    } catch (error) {
      console.error("Error updating care plan:", error);
      toast.error("Failed to update care plan");
    }
  };

  // Add new function to handle form changes
  const handleShiftCheckboxChange = (shiftKey: string) => {
    setEditedCarePlan(prev => ({
      ...prev,
      additionalShifts: {
        ...prev.additionalShifts,
        [shiftKey]: !prev.additionalShifts[shiftKey as keyof typeof prev.additionalShifts]
      }
    }));
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
              {isEditMode ? (
                <div className="mb-2">
                  <Label htmlFor="title">Plan Title</Label>
                  <Input 
                    id="title" 
                    value={editedCarePlan.title}
                    onChange={(e) => setEditedCarePlan({...editedCarePlan, title: e.target.value})}
                    className="mb-2"
                  />
                  
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={editedCarePlan.description}
                    onChange={(e) => setEditedCarePlan({...editedCarePlan, description: e.target.value})}
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{carePlan?.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    {carePlan?.description || "No description provided"}
                  </p>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" onClick={toggleEditMode}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={saveCarePlanChanges}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={toggleEditMode}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Plan
                </Button>
              )}
              
              <Badge className={`${
                carePlan?.status === 'active' ? 'bg-green-100 text-green-800' :
                carePlan?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {carePlan?.status.charAt(0).toUpperCase() + carePlan?.status.slice(1)}
              </Badge>
            </div>
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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Care Plan Details</CardTitle>
                  <CardDescription>
                    Information about this care plan
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-2">Plan Type</h3>
                      <RadioGroup 
                        value={editedCarePlan.planType} 
                        onValueChange={(value) => setEditedCarePlan({...editedCarePlan, planType: value as PlanType})}
                        className="space-y-2"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="scheduled" id="edit-scheduled" />
                          <div className="grid gap-1 leading-none">
                            <Label htmlFor="edit-scheduled" className="font-medium">
                              Scheduled Care Plan
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Regularly scheduled caregiving shifts
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="on-demand" id="edit-on-demand" />
                          <div className="grid gap-1 leading-none">
                            <Label htmlFor="edit-on-demand" className="font-medium">
                              On-Demand Care
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Flexible care shifts as needed
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="both" id="edit-both" />
                          <div className="grid gap-1 leading-none">
                            <Label htmlFor="edit-both" className="font-medium">
                              Both (Scheduled + On-Demand)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Regular scheduled care with additional on-demand support
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {(editedCarePlan.planType === "scheduled" || editedCarePlan.planType === "both") && (
                      <>
                        <div>
                          <h3 className="text-base font-medium mb-2">Primary Weekday Coverage</h3>
                          <RadioGroup 
                            value={editedCarePlan.weekdayOption} 
                            onValueChange={(value) => setEditedCarePlan({...editedCarePlan, weekdayOption: value as WeekdayOption})}
                            className="space-y-2"
                          >
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="8am-4pm" id="edit-option1" />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-option1" className="font-medium">
                                  Monday - Friday, 8 AM - 4 PM
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Standard daytime coverage
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="6am-6pm" id="edit-option2" />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-option2" className="font-medium">
                                  Monday - Friday, 6 AM - 6 PM
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Extended daytime coverage
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="6pm-8am" id="edit-option3" />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-option3" className="font-medium">
                                  Monday - Friday, 6 PM - 8 AM
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Extended nighttime coverage
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="none" id="edit-option-none" />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-option-none" className="font-medium">
                                  No Weekday Coverage
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Skip weekday coverage
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <h3 className="text-base font-medium mb-2">Weekend Coverage</h3>
                          <RadioGroup 
                            value={editedCarePlan.weekendOption} 
                            onValueChange={(value) => setEditedCarePlan({...editedCarePlan, weekendOption: value as WeekendOption})}
                            className="space-y-2"
                          >
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="yes" id="edit-weekend-yes" />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-weekend-yes" className="font-medium">
                                  Saturday - Sunday, 6 AM - 6 PM
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Daytime weekend coverage
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem value="no" id="edit-weekend-no" />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-weekend-no" className="font-medium">
                                  No Weekend Coverage
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Skip regular weekend coverage
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <h3 className="text-base font-medium mb-2">Additional Shifts</h3>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Checkbox 
                                id="edit-shift-4pm-6am"
                                checked={editedCarePlan.additionalShifts.weekdayEvening4pmTo6am} 
                                onCheckedChange={() => handleShiftCheckboxChange('weekdayEvening4pmTo6am')}
                              />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-shift-4pm-6am" className="font-medium">
                                  Weekday Evening (4 PM - 6 AM)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Evening care after primary shift
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <Checkbox 
                                id="edit-shift-4pm-8am"
                                checked={editedCarePlan.additionalShifts.weekdayEvening4pmTo8am} 
                                onCheckedChange={() => handleShiftCheckboxChange('weekdayEvening4pmTo8am')}
                              />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-shift-4pm-8am" className="font-medium">
                                  Weekday Evening (4 PM - 8 AM)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Evening care after primary shift
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <Checkbox 
                                id="edit-shift-6pm-6am"
                                checked={editedCarePlan.additionalShifts.weekdayEvening6pmTo6am} 
                                onCheckedChange={() => handleShiftCheckboxChange('weekdayEvening6pmTo6am')}
                              />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-shift-6pm-6am" className="font-medium">
                                  Weekday Evening (6 PM - 6 AM)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Evening care after primary shift
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <Checkbox 
                                id="edit-shift-6pm-8am"
                                checked={editedCarePlan.additionalShifts.weekdayEvening6pmTo8am} 
                                onCheckedChange={() => handleShiftCheckboxChange('weekdayEvening6pmTo8am')}
                              />
                              <div className="grid gap-1 leading-none">
                                <Label htmlFor="edit-shift-6pm-8am" className="font-medium">
                                  Weekday Evening (6 PM - 8 AM)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Evening care after primary shift
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-base font-medium mb-1">Plan Type</h3>
                        <p className="text-sm text-muted-foreground">
                          {getPlanTypeDisplay(carePlan)}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-1">Status</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {carePlan.status}
                        </p>
                      </div>
                      
                      {(carePlan.metadata?.plan_type === "scheduled" || carePlan.metadata?.plan_type === "both") && (
                        <>
                          <div>
                            <h3 className="text-base font-medium mb-1">Weekday Coverage</h3>
                            <p className="text-sm text-muted-foreground">
                              {carePlan.metadata?.weekday_coverage === "8am-4pm" && "Monday - Friday, 8 AM - 4 PM"}
                              {carePlan.metadata?.weekday_coverage === "6am-6pm" && "Monday - Friday, 6 AM - 6 PM"}
                              {carePlan.metadata?.weekday_coverage === "6pm-8am" && "Monday - Friday, 6 PM - 8 AM"}
                              {carePlan.metadata?.weekday_coverage === "none" && "No weekday coverage"}
                              {!carePlan.metadata?.weekday_coverage && "Not specified"}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-base font-medium mb-1">Weekend Coverage</h3>
                            <p className="text-sm text-muted-foreground">
                              {carePlan.metadata?.weekend_coverage === "yes" ? 
                                "Saturday - Sunday, 6 AM - 6 PM" : 
                                "No weekend coverage"
                              }
                            </p>
                          </div>
                          
                          <div className="md:col-span-2">
                            <h3 className="text-base font-medium mb-1">Additional Shifts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {carePlan.metadata?.additional_shifts?.weekdayEvening4pmTo6am && (
                                <Badge variant="outline" className="justify-start">
                                  Weekday Evening (4 PM - 6 AM)
                                </Badge>
                              )}
                              {carePlan.metadata?.additional_shifts?.weekdayEvening4pmTo8am && (
                                <Badge variant="outline" className="justify-start">
                                  Weekday Evening (4 PM - 8 AM)
                                </Badge>
                              )}
                              {carePlan.metadata?.additional_shifts?.weekdayEvening6pmTo6am && (
                                <Badge variant="outline" className="justify-start">
                                  Weekday Evening (6 PM - 6 AM)
                                </Badge>
                              )}
                              {carePlan.metadata?.additional_shifts?.weekdayEvening6pmTo8am && (
                                <Badge variant="outline" className="justify-start">
                                  Weekday Evening (6 PM - 8 AM)
                                </Badge>
                              )}
                              {!carePlan.metadata?.additional_shifts?.weekdayEvening4pmTo6am && 
                                !carePlan.metadata?.additional_shifts?.weekdayEvening4pmTo8am &&
                                !carePlan.metadata?.additional_shifts?.weekdayEvening6pmTo6am &&
                                !carePlan.metadata?.additional_shifts?.weekdayEvening6pmTo8am && (
                                <p className="text-sm text-muted-foreground">
                                  No additional shifts
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Care Team</CardTitle>
                  <CardDescription>
                    People helping with this care plan
                  </CardDescription>
                </div>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Assign Team Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Team Member</DialogTitle>
                      <DialogDescription>
                        Add a professional to this care plan's team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="professional">Select Professional</Label>
                        <Select 
                          value={newTeamMember.caregiverId} 
                          onValueChange={(value) => setNewTeamMember({...newTeamMember, caregiverId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a professional" />
                          </SelectTrigger>
                          <SelectContent>
                            {professionals.map(prof => (
                              <SelectItem key={prof.id} value={prof.id}>
                                {prof.full_name || "Unnamed"} 
                                {prof.professional_type && `(${prof.professional_type})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select 
                          value={newTeamMember.role} 
                          onValueChange={(value) => setNewTeamMember({...newTeamMember, role: value as "caregiver" | "coordinator" | "supervisor"})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="caregiver">Caregiver</SelectItem>
                            <SelectItem value="coordinator">Care Coordinator</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea 
                          id="notes" 
                          placeholder="Any special instructions or notes about this team member's role"
                          value={newTeamMember.notes}
                          onChange={(e) => setNewTeamMember({...newTeamMember, notes: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleInviteTeamMember}>Assign to Team</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {careTeamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No team members yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Assign professionals to help provide care
                    </p>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Assign First Team Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {careTeamMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.professionalDetails?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(member.professionalDetails?.full_name, member.caregiver_id)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{member.professionalDetails?.full_name || "Unnamed Professional"}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="capitalize">
                                {member.role}
                              </Badge>
                              {member.professionalDetails?.professional_type && (
                                <span className="text-xs text-muted-foreground">
                                  {member.professionalDetails.professional_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setMemberToRemove(member);
                              setConfirmRemoveDialogOpen(true);
                            }}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Dialog open={confirmRemoveDialogOpen} onOpenChange={setConfirmRemoveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Team Member</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this team member from the care plan?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {memberToRemove && (
                    <p className="font-medium">
                      {memberToRemove.professionalDetails?.full_name || "This professional"} will no longer have access to this care plan.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmRemoveDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleRemoveTeamMember}>Remove</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Care Schedule</CardTitle>
                  <CardDescription>
                    Manage care shifts and assignments
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Add Shift Range
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingShift ? "Edit Care Shift" : "Add New Care Shift"}</DialogTitle>
                        <DialogDescription>
                          {isRangeSelection ? 
                            "Create shifts for multiple days at once" : 
                            "Schedule a caregiver for a specific time"
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-full md:w-1/2">
                            <RadioGroup 
                              value={isRangeSelection ? "range" : "single"} 
                              onValueChange={(value) => setIsRangeSelection(value === "range")}
                              className="grid grid-cols-2 gap-2 mb-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="single" id="single-day" />
                                <Label htmlFor="single-day">Single Day</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="range" id="date-range" />
                                <Label htmlFor="date-range">Date Range</Label>
                              </div>
                            </RadioGroup>
                            
                            {isRangeSelection ? (
                              <div className="grid gap-2">
                                <Label>Date Range</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarRange className="mr-2 h-4 w-4" />
                                      {dateRange?.from ? (
                                        dateRange.to ? (
                                          <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                          </>
                                        ) : (
                                          format(dateRange.from, "LLL dd, y")
                                        )
                                      ) : (
                                        <span>Pick a date range</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      initialFocus
                                      mode="range"
                                      defaultMonth={new Date()}
                                      selected={dateRange}
                                      onSelect={setDateRange}
                                      numberOfMonths={2}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ) : (
                              <div className="grid gap-2">
                                <Label>Shift Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {selectedDay ? (
                                        format(selectedDay, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={selectedDay || undefined}
                                      onSelect={(date) => setSelectedDay(date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full md:w-1/2 grid gap-3">
                            <div className="grid gap-2">
                              <Label>Shift Type</Label>
                              <Select 
                                value={newShift.selectedShiftType} 
                                onValueChange={(value) => setNewShift({...newShift, selectedShiftType: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select shift type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="weekday_standard">Monday - Friday, 8 AM - 4 PM</SelectItem>
                                  <SelectItem value="weekday_extended">Monday - Friday, 6 AM - 6 PM</SelectItem>
                                  <SelectItem value="weekday_night">Monday - Friday, 6 PM - 8 AM</SelectItem>
                                  <SelectItem value="saturday_sunday">Saturday - Sunday, 6 AM - 6 PM</SelectItem>
                                  <SelectItem value="weekday_evening_4pm_6am">Weekday Evening (4 PM - 6 AM)</SelectItem>
                                  <SelectItem value="weekday_evening_4pm_8am">Weekday Evening (4 PM - 8 AM)</SelectItem>
                                  <SelectItem value="weekday_evening_6pm_6am">Weekday Evening (6 PM - 6 AM)</SelectItem>
                                  <SelectItem value="weekday_evening_6pm_8am">Weekday Evening (6 PM - 8 AM)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="caregiver">Assign Caregiver (Optional)</Label>
                              <Select 
                                value={newShift.caregiverId} 
                                onValueChange={(value) => setNewShift({...newShift, caregiverId: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {careTeamMembers.map(member => (
                                    <SelectItem key={member.caregiver_id} value={member.caregiver_id}>
                                      {member.professionalDetails?.full_name || "Unnamed"} 
                                      {member.professionalDetails?.professional_type && `(${member.professionalDetails.professional_type})`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateShift}>
                          {editingShift ? "Update Shift" : (isRangeSelection ? "Create Shifts" : "Create Shift")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigateWeek('prev')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Week
                  </Button>
                  
                  <h3 className="text-sm font-medium">
                    Week of {format(selectedWeek, "MMMM d, yyyy")}
                  </h3>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigateWeek('next')}
                  >
                    Next Week
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDays().map((day, i) => (
                    <div 
                      key={i} 
                      className={`border rounded-lg p-2 min-h-[120px] ${
                        isSameDay(day, new Date()) ? 'bg-muted/50 border-primary/20' : ''
                      }`}
                    >
                      <div className="text-center mb-2">
                        <div className="text-xs text-muted-foreground">
                          {DAYS_OF_WEEK[i]}
                        </div>
                        <div className="font-medium">
                          {format(day, "d")}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {getShiftsForDay(day).map(shift => (
                          <div 
                            key={shift.id}
                            className="bg-primary/10 p-1.5 rounded text-xs cursor-pointer hover:bg-primary/20"
                            onClick={() => handleEditShift(shift)}
                          >
                            <div className="font-medium truncate">{shift.title}</div>
                            <div className="flex justify-between items-center text-muted-foreground">
                              <span>{getTimeDisplay(shift.start_time)} - {getTimeDisplay(shift.end_time)}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 ml-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteShift(shift.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-muted-foreground truncate">
                              {getCaregiverName(shift.caregiver_id)}
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full h-6 text-xs"
                          onClick={() => openNewShiftDialog(day)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default CarePlanDetailPage;
