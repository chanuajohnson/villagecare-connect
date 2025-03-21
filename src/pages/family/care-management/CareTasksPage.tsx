import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Plus, 
  ClipboardList, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  Circle 
} from "lucide-react";
import { CarePlan, CareTask, CareTaskStatus, CareTeamMember } from "@/types/care-management";
import { 
  fetchCarePlan, 
  fetchCareTasks,
  createCareTask,
  updateCareTask,
  deleteCareTask 
} from "@/services/care-plan-service";
import { fetchCareTeamMembers } from "@/services/care-team-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export const createTask = async (taskData: Omit<CareTask, "id" | "created_at" | "updated_at">) => {
  // Ensure title is provided
  if (!taskData.title) {
    throw new Error("Task title is required");
  }
  
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .insert(taskData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating care task:', error);
    throw error;
  }
};

export default function CareTasksPage() {
  const { carePlanId } = useParams<{ carePlanId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CareTask | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<CareTask | null>(null);

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
      label: "Tasks",
      path: `/dashboard/family/care-plans/${carePlanId}/tasks`,
    },
  ];

  // Form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      assigned_to: "",
      status: "pending",
    },
  });

  // Queries
  const { data: carePlan } = useQuery({
    queryKey: ['carePlan', carePlanId],
    queryFn: () => (carePlanId ? fetchCarePlan(carePlanId) : Promise.resolve(null)),
    enabled: !!carePlanId,
  });

  const { data: careTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['careTasks', carePlanId],
    queryFn: () => (carePlanId ? fetchCareTasks(carePlanId) : Promise.resolve([])),
    enabled: !!carePlanId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['careTeamMembers', carePlanId],
    queryFn: () => (carePlanId ? fetchCareTeamMembers(carePlanId) : Promise.resolve([])),
    enabled: !!carePlanId,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<CareTask, 'id' | 'created_at' | 'updated_at'>) => createCareTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTasks'] });
      setTaskFormOpen(false);
      form.reset();
      toast.success("Care task created successfully!");
    },
    onError: (error) => {
      console.error("Error creating care task:", error);
      toast.error("Failed to create care task.");
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<CareTask> }) => updateCareTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTasks'] });
      setTaskFormOpen(false);
      setEditingTask(null);
      form.reset();
      toast.success("Care task updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating care task:", error);
      toast.error("Failed to update care task.");
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteCareTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTasks'] });
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast.success("Care task deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting care task:", error);
      toast.error("Failed to delete care task.");
    }
  });

  const toggleTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: CareTaskStatus }) => updateCareTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careTasks'] });
    },
    onError: (error) => {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status.");
    }
  });

  // Set form values when editing a task
  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description || "",
        due_date: editingTask.due_date || "",
        assigned_to: editingTask.assigned_to || "",
        status: editingTask.status,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        due_date: "",
        assigned_to: "",
        status: "pending",
      });
    }
  }, [editingTask, form]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle form submission
  const onSubmit = (values: TaskFormValues) => {
    if (!carePlanId) return;

    const taskData = {
      ...values,
      care_plan_id: carePlanId,
      due_date: values.due_date || undefined,
      assigned_to: values.assigned_to || undefined,
    };

    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, updates: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  // Edit task
  const handleEditTask = (task: CareTask) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  // Delete task
  const handleDeleteTask = (task: CareTask) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  // Toggle task status
  const toggleTaskStatus = (task: CareTask) => {
    const newStatus: CareTaskStatus = task.status === "completed" ? "pending" : "completed";
    toggleTaskStatusMutation.mutate({ id: task.id, status: newStatus });
  };

  // Get color for task status
  const getStatusColor = (status: CareTaskStatus) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "pending":
      default:
        return "text-gray-600";
    }
  };

  // Find assigned team member name
  const getAssignedToName = (assignedToId?: string) => {
    if (!assignedToId) return "Unassigned";
    
    const teamMember = teamMembers.find(member => member.caregiver_id === assignedToId);
    return teamMember?.caregiver?.full_name || "Unknown";
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

  // Filter and sort tasks
  const pendingTasks = careTasks.filter(task => task.status !== "completed");
  const completedTasks = careTasks.filter(task => task.status === "completed");

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
            <div>
              <h1 className="text-3xl font-bold">Care Tasks</h1>
              {carePlan && (
                <p className="text-gray-600">
                  Plan: {carePlan.title}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => {
            setEditingTask(null);
            setTaskFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
              Active Tasks
            </CardTitle>
            <CardDescription>
              Tasks that need to be completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : pendingTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Status</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className="cursor-pointer hover:opacity-80"
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          {task.title}
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getAssignedToName(task.assigned_to)}</TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            {formatDate(task.due_date)}
                          </div>
                        ) : (
                          "No due date"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium">No Active Tasks</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Add your first task to get started
                </p>
                <Button onClick={() => {
                  setEditingTask(null);
                  setTaskFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                Completed Tasks
              </CardTitle>
              <CardDescription>
                Tasks that have been finished
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Status</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className="cursor-pointer hover:opacity-80"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <span className="line-through text-gray-500">{task.title}</span>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-1 line-through">{task.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {getAssignedToName(task.assigned_to)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {task.due_date ? formatDate(task.due_date) : "No due date"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteTask(task)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Task Form Dialog */}
        <Dialog open={taskFormOpen} onOpenChange={setTaskFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Update the task details below."
                  : "Fill out the form to create a new care task."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add details about this task" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To (Optional)</FormLabel>
                      <Select 
                        value={field.value || ""} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {teamMembers.map((member: CareTeamMember) => (
                            <SelectItem 
                              key={member.caregiver_id} 
                              value={member.caregiver_id}
                            >
                              {member.caregiver?.full_name || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setTaskFormOpen(false);
                      setEditingTask(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending || updateTaskMutation.isPending
                      ? "Saving..."
                      : editingTask
                      ? "Update Task"
                      : "Add Task"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => taskToDelete && deleteTaskMutation.mutate(taskToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
