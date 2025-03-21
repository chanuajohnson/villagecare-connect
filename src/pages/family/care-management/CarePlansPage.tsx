
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CarePlanCard } from "@/components/family/care-management/CarePlanCard";
import { CarePlanForm } from "@/components/family/care-management/CarePlanForm";
import { toast } from "sonner";
import { fetchCarePlans, createCarePlan, updateCarePlan, deleteCarePlan } from "@/services/care-plan-service";
import { fetchCareTeamMembers } from "@/services/care-team-service";
import { fetchCareTasks } from "@/services/care-plan-service";
import { CarePlan } from "@/types/care-management";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CarePlansPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCarePlan, setEditingCarePlan] = useState<CarePlan | undefined>(undefined);

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
  ];

  // Fetch care plans
  const { data: carePlans = [], isLoading: isLoadingCarePlans } = useQuery({
    queryKey: ['carePlans', user?.id],
    queryFn: () => (user?.id ? fetchCarePlans(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newPlan: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>) => createCarePlan(newPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      setFormOpen(false);
      toast.success("Care plan created successfully!");
    },
    onError: (error) => {
      console.error("Error creating care plan:", error);
      toast.error("Failed to create care plan.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<CarePlan> }) => updateCarePlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      setFormOpen(false);
      setEditingCarePlan(undefined);
      toast.success("Care plan updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating care plan:", error);
      toast.error("Failed to update care plan.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCarePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      toast.success("Care plan deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting care plan:", error);
      toast.error("Failed to delete care plan.");
    }
  });

  // For tracking team member and task counts
  const [planDetails, setPlanDetails] = useState<Record<string, { teamCount: number, taskCount: number }>>({});

  // Load team members and tasks for each care plan
  useEffect(() => {
    const loadPlanDetails = async () => {
      const details: Record<string, { teamCount: number, taskCount: number }> = {};
      
      for (const plan of carePlans) {
        try {
          const [teamMembers, tasks] = await Promise.all([
            fetchCareTeamMembers(plan.id),
            fetchCareTasks(plan.id)
          ]);
          
          details[plan.id] = {
            teamCount: teamMembers.length,
            taskCount: tasks.length
          };
        } catch (error) {
          console.error(`Error loading details for plan ${plan.id}:`, error);
          details[plan.id] = { teamCount: 0, taskCount: 0 };
        }
      }
      
      setPlanDetails(details);
    };
    
    if (carePlans.length > 0) {
      loadPlanDetails();
    }
  }, [carePlans]);

  const handleCreatePlan = () => {
    setEditingCarePlan(undefined);
    setFormOpen(true);
  };

  const handleEditPlan = (plan: CarePlan) => {
    setEditingCarePlan(plan);
    setFormOpen(true);
  };

  const handleDeletePlan = (plan: CarePlan) => {
    deleteMutation.mutate(plan.id);
  };

  const handleFormSubmit = (values: any) => {
    if (editingCarePlan) {
      updateMutation.mutate({
        id: editingCarePlan.id,
        updates: values
      });
    } else if (user?.id) {
      createMutation.mutate({
        ...values,
        family_id: user.id
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Care Plans</h1>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Care Plan
          </Button>
        </div>

        {isLoadingCarePlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : carePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carePlans.map((plan) => (
              <CarePlanCard
                key={plan.id}
                carePlan={plan}
                teamMemberCount={planDetails[plan.id]?.teamCount || 0}
                taskCount={planDetails[plan.id]?.taskCount || 0}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Care Plans Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first care plan to start managing care coordination.
            </p>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Care Plan
            </Button>
          </div>
        )}

        <CarePlanForm
          open={formOpen}
          onOpenChange={setFormOpen}
          initialData={editingCarePlan}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}
