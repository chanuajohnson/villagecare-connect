import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { ArrowLeft, Calendar, Clock, FileText, Plus, Users } from "lucide-react";
import { fetchCarePlan, fetchCareTeamMembers, inviteCareTeamMember, CareTeamMember, CarePlan } from "@/services/care-plan-service";
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

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [newTeamMember, setNewTeamMember] = useState({
    caregiverId: "",
    role: "caregiver" as const,
    notes: ""
  });

  useEffect(() => {
    if (user && id) {
      loadCarePlan();
      loadCareTeamMembers();
      loadProfessionals();
    } else {
      setLoading(false);
    }
  }, [user, id]);

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
      setCareTeamMembers(members);
    } catch (error) {
      console.error("Error loading care team members:", error);
      toast.error("Failed to load care team members");
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
      
      // Reset form
      setNewTeamMember({
        caregiverId: "",
        role: "caregiver",
        notes: ""
      });
      
      // Refresh team members list
      loadCareTeamMembers();
    } catch (error) {
      console.error("Error assigning team member:", error);
      toast.error("Failed to assign team member");
    }
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
                {careTeamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.caregiver_id.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{member.caregiver_id}</CardTitle>
                            <CardDescription>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
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
                ))}
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
              <CardHeader>
                <CardTitle>Care Schedule</CardTitle>
                <CardDescription>
                  Manage care shifts and appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  This feature will allow you to schedule and assign care shifts to care team members.
                </p>
                
                {careTeamMembers.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">Schedule Shifts</h3>
                    <div className="bg-muted/50 p-6 rounded-md text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium mb-1">Shift scheduling coming soon</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        You can already assign care professionals to this care plan.
                      </p>
                    </div>
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
