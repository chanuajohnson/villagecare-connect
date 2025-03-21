
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Plus, 
  Edit,
  Trash2,
  User,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Navigation } from '@/components/layout/Navigation';
import { format } from 'date-fns';
import { CareTask, CareTaskStatus } from '@/types/care-management';
import { fetchCarePlan, createTask, updateTask, deleteTask } from '@/services/care-plan-service';
import { supabase } from '@/lib/supabase';

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  assigned_to: string;
  status: CareTaskStatus;
}

export default function CareTasksPage() {
  const { carePlanId } = useParams<{ carePlanId: string }>();
  const { user } = useAuth();
  const [carePlan, setCarePlan] = useState<any>(null);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<CareTask | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    assigned_to: '',
    status: 'pending'
  });
  
  useEffect(() => {
    if (carePlanId && user) {
      loadData();
    }
  }, [carePlanId, user]);

  const loadData = async () => {
    try {
      // Load care plan data
      const planData = await fetchCarePlan(carePlanId || '');
      setCarePlan(planData);
      
      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('care_tasks')
        .select('*')
        .eq('care_plan_id', carePlanId)
        .order('due_date', { ascending: true });
      
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      
      // Load team members
      const { data: teamData, error: teamError } = await supabase
        .from('care_team_members')
        .select(`
          id,
          caregiver_id,
          role,
          caregiver:caregiver_id (
            id,
            full_name,
            avatar_url,
            professional_type
          )
        `)
        .eq('care_plan_id', carePlanId)
        .eq('status', 'active');
      
      if (teamError) throw teamError;
      setTeamMembers(teamData || []);
      
    } catch (error) {
      console.error('Error loading care plan data:', error);
      toast.error('Failed to load care plan data');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
      assigned_to: '',
      status: 'pending'
    });
    setCurrentTask(null);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!carePlanId) return;
      
      // Create the new task
      const newTask = {
        care_plan_id: carePlanId,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        assigned_to: formData.assigned_to,
        status: formData.status
      };
      
      const createdTask = await createTask(newTask);
      setTasks(prev => [...prev, createdTask]);
      
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentTask || !carePlanId) return;
      
      const updatedTask = {
        id: currentTask.id,
        care_plan_id: carePlanId,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        assigned_to: formData.assigned_to,
        status: formData.status
      };
      
      await updateTask(updatedTask);
      
      setTasks(prev => 
        prev.map(task => task.id === currentTask.id ? { ...task, ...updatedTask } : task)
      );
      
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      if (!currentTask) return;
      
      await deleteTask(currentTask.id);
      
      setTasks(prev => prev.filter(task => task.id !== currentTask.id));
      
      setIsDeleteDialogOpen(false);
      resetForm();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const openEditDialog = (task: CareTask) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
      assigned_to: task.assigned_to || '',
      status: task.status
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: CareTask) => {
    setCurrentTask(task);
    setIsDeleteDialogOpen(true);
  };

  const getAssigneeName = (assigneeId: string) => {
    const member = teamMembers.find(m => m.caregiver_id === assigneeId);
    return member?.caregiver?.full_name || 'Unassigned';
  };

  const getStatusIcon = (status: CareTaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: CareTaskStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (!carePlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading care plan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <div className="mb-8">
          <Link to={`/dashboard/family/care-plans`} className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Care Plans
          </Link>
          
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{carePlan.title} - Tasks</h1>
              <p className="text-muted-foreground mt-1">{carePlan.description}</p>
            </div>
            
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          
          <div className="flex mt-4 space-x-2">
            <Link to={`/dashboard/family/care-plans/${carePlanId}/team`}>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Care Team
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground mb-4">No tasks have been added to this care plan yet.</p>
                <Button onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            tasks.map(task => (
              <Card key={task.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <CardTitle className="text-xl">{task.title}</CardTitle>
                        <CardDescription className="mt-1">{task.description}</CardDescription>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(task)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-between text-sm text-muted-foreground gap-2">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      <span>{getAssigneeName(task.assigned_to || '')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a new task to the care plan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask}>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select 
                  value={formData.assigned_to} 
                  onValueChange={(value) => handleSelectChange('assigned_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.caregiver_id} value={member.caregiver_id}>
                        {member.caregiver?.full_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value as CareTaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTask}>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-due_date">Due Date</Label>
                <Input
                  id="edit-due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-assigned_to">Assigned To</Label>
                <Select 
                  value={formData.assigned_to} 
                  onValueChange={(value) => handleSelectChange('assigned_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.caregiver_id} value={member.caregiver_id}>
                        {member.caregiver?.full_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value as CareTaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
