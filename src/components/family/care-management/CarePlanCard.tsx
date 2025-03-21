
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ClipboardList, 
  Edit, 
  Trash, 
  UserPlus,
  Users,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CarePlan } from "@/types/care-management";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CarePlanCardProps {
  carePlan: CarePlan;
  teamMemberCount: number;
  taskCount: number;
  onEdit: (carePlan: CarePlan) => void;
  onDelete: (carePlan: CarePlan) => void;
}

export function CarePlanCard({ carePlan, teamMemberCount, taskCount, onEdit, onDelete }: CarePlanCardProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleViewTasks = () => {
    navigate(`/dashboard/family/care-plans/${carePlan.id}/tasks`);
  };

  const handleViewTeam = () => {
    navigate(`/dashboard/family/care-plans/${carePlan.id}/team`);
  };

  const handleViewSchedule = () => {
    navigate(`/dashboard/family/care-plans/${carePlan.id}/schedule`);
  };

  const handleEditClick = () => {
    onEdit(carePlan);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(carePlan);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{carePlan.title}</CardTitle>
            <CardDescription className="mt-1">
              Created: {formatDate(carePlan.created_at)}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(carePlan.status)} variant="outline">
              {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Care Plan Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewTasks}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewTeam}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewSchedule}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">
          {carePlan.description || "No description provided."}
        </p>
        <div className="flex space-x-4 mt-2">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{teamMemberCount} team members</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClipboardList className="h-4 w-4 mr-1" />
            <span>{taskCount} tasks</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" onClick={handleViewTeam}>
          <UserPlus className="h-4 w-4 mr-2" />
          Team
        </Button>
        <Button variant="outline" onClick={handleViewTasks}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Tasks
        </Button>
        <Button variant="outline" onClick={handleViewSchedule}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </CardFooter>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the care plan "{carePlan.title}" and all associated tasks, team members, and shifts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
