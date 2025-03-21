
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Edit, 
  Trash, 
  MoreHorizontal, 
  Search,
  ArrowLeft
} from "lucide-react";
import { CareTeamMember, CareTeamMemberRole, CareTeamMemberStatus } from "@/types/care-management";
import { toast } from "sonner";
import { 
  fetchCareTeamMembers, 
  addCareTeamMember, 
  updateCareTeamMember, 
  removeCareTeamMember,
  searchProfessionals
} from "@/services/care-team-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CareTeamPage() {
  const { carePlanId } = useParams<{ carePlanId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<CareTeamMemberRole>("caregiver");
  const [notes, setNotes] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<CareTeamMember | null>(null);
  const [removingMember, setRemovingMember] = useState<CareTeamMember | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Family",
      path: "/dashboard/family",
    },
    {
      label: "Care Plans",
      path: "/dashboard/family/care-plans",
    },
    {
      label: "Team",
      path: `/dashboard/family/care-plans/${carePlanId}/team`,
    },
  ];

  // Fetch team members
  const { 
    data: teamMembers = [], 
    isLoading: isLoadingTeamMembers 
  } = useQuery({
    queryKey: ['careTeamMembers', carePlanId],
    queryFn: () => (carePlanId ? fetchCareTeamMembers(carePlanId) : Promise.resolve([])),
    enabled: !!carePlanId,
  });

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: (member: Omit<CareTeamMember, 'id' | 'created_at' | 'updated_at' | 'caregiver'>) => 
      addCareTeamMember(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTeamMembers'] });
      setAddMemberOpen(false);
      resetForm();
      toast.success("Team member added successfully!");
    },
    onError: (error) => {
      console.error("Error adding team member:", error);
      toast.error("Failed to add team member.");
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<CareTeamMember> }) => 
      updateCareTeamMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTeamMembers'] });
      setIsEditing(false);
      setEditingMember(null);
      toast.success("Team member updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member.");
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id: string) => removeCareTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTeamMembers'] });
      setRemovingMember(null);
      toast.success("Team member removed successfully!");
    },
    onError: (error) => {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member.");
    }
  });

  // Search professionals
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      // Get existing caregiver IDs to exclude
      const existingIds = teamMembers.map(member => member.caregiver_id);
      const results = await searchProfessionals(searchTerm, existingIds);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching professionals:", error);
      toast.error("Failed to search professionals.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedProfessional(null);
    setSelectedRole("caregiver");
    setNotes("");
  };

  // Edit member
  const handleEditMember = (member: CareTeamMember) => {
    setEditingMember(member);
    setSelectedRole(member.role);
    setNotes(member.notes || "");
    setIsEditing(true);
  };

  // Remove member
  const handleRemoveMember = (member: CareTeamMember) => {
    setRemovingMember(member);
  };

  // Confirm remove
  const confirmRemoveMember = () => {
    if (removingMember) {
      removeMemberMutation.mutate(removingMember.id);
    }
  };

  // Add member form submission
  const handleAddMember = () => {
    if (!selectedProfessional) {
      toast.error("Please select a professional");
      return;
    }

    if (!user?.id || !carePlanId) {
      toast.error("Missing required information");
      return;
    }

    const newMember = {
      care_plan_id: carePlanId,
      family_id: user.id,
      caregiver_id: selectedProfessional.id,
      status: "active" as CareTeamMemberStatus,
      role: selectedRole,
      notes: notes.trim() || undefined
    };

    addMemberMutation.mutate(newMember);
  };

  // Update member form submission
  const handleUpdateMember = () => {
    if (!editingMember) return;

    const updates = {
      role: selectedRole,
      notes: notes.trim() || undefined
    };

    updateMemberMutation.mutate({ id: editingMember.id, updates });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: CareTeamMemberStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "removed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get role badge color
  const getRoleBadgeClass = (role: CareTeamMemberRole) => {
    switch (role) {
      case "primary":
        return "bg-blue-100 text-blue-800";
      case "backup":
        return "bg-purple-100 text-purple-800";
      case "caregiver":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!carePlanId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Missing care plan ID</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/family/care-plans")}>
              Go back to Care Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => navigate("/dashboard/family/care-plans")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Care Team</h1>
          </div>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Search for and add professional caregivers to this care plan.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Search Professionals</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Search by name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={searchLoading}>
                      {searchLoading ? "Searching..." : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Search Results</label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                      {searchResults.map((professional) => (
                        <div
                          key={professional.id}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            selectedProfessional?.id === professional.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedProfessional(professional)}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={professional.avatar_url} />
                            <AvatarFallback>
                              {professional.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{professional.full_name}</p>
                            <p className="text-xs text-gray-500">{professional.professional_type}</p>
                          </div>
                          {selectedProfessional?.id === professional.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProfessional && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Team Member Role</label>
                      <Select 
                        value={selectedRole} 
                        onValueChange={(value: CareTeamMemberRole) => setSelectedRole(value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary Caregiver</SelectItem>
                          <SelectItem value="backup">Backup Caregiver</SelectItem>
                          <SelectItem value="caregiver">Regular Caregiver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Notes (Optional)</label>
                      <Textarea
                        placeholder="Add any notes about this team member"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setAddMemberOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedProfessional || addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add to Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingTeamMembers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-2">
                        <AvatarImage src={member.caregiver?.avatar_url} />
                        <AvatarFallback>
                          {member.caregiver?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.caregiver?.full_name}</CardTitle>
                        <CardDescription className="text-sm">
                          {member.caregiver?.professional_type || "Professional"}
                          {member.caregiver?.years_of_experience && ` • ${member.caregiver.years_of_experience} experience`}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Team Member Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role & Notes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex space-x-2 mb-2">
                    <Badge className={getStatusBadgeClass(member.status)} variant="outline">
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                    <Badge className={getRoleBadgeClass(member.role)} variant="outline">
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                  {member.notes && (
                    <p className="text-sm text-gray-700 mt-2">
                      {member.notes}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleEditMember(member)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Team Members Yet</h3>
            <p className="text-gray-600 mb-4">
              Add professional caregivers to this care plan to create your care team.
            </p>
            <Button onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        )}

        {/* Edit Member Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update role and notes for {editingMember?.caregiver?.full_name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Member Role</label>
                <Select value={selectedRole} onValueChange={(value: CareTeamMemberRole) => setSelectedRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Caregiver</SelectItem>
                    <SelectItem value="backup">Backup Caregiver</SelectItem>
                    <SelectItem value="caregiver">Regular Caregiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this team member"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setEditingMember(null);
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMember}
                disabled={updateMemberMutation.isPending}
              >
                {updateMemberMutation.isPending ? "Updating..." : "Update Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Member Confirmation Dialog */}
        <AlertDialog open={!!removingMember} onOpenChange={(open) => !open && setRemovingMember(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {removingMember?.caregiver?.full_name} from this care team?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveMember}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
