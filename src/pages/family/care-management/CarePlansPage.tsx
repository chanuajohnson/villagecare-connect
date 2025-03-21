
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { fetchCarePlans, fetchCareTasks, createCarePlan, updateCarePlan, deleteCarePlan } from '@/services/care-plan-service';
import { CarePlan } from '@/types/care-management';
import { CarePlanCard } from '@/components/family/care-management/CarePlanCard';
import { CarePlanForm } from '@/components/family/care-management/CarePlanForm';

const CarePlansPage = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [carePlanTaskCounts, setCarePlanTaskCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCarePlan, setSelectedCarePlan] = useState<CarePlan | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      requireAuth('access care plans');
      return;
    }

    const loadCarePlans = async () => {
      setIsLoading(true);
      try {
        const plans = await fetchCarePlans(user.id);
        setCarePlans(plans);
        
        // Fetch task counts for each care plan
        const taskCounts: Record<string, number> = {};
        for (const plan of plans) {
          const tasks = await fetchCareTasks(plan.id);
          taskCounts[plan.id] = tasks.length;
        }
        setCarePlanTaskCounts(taskCounts);
      } catch (error) {
        console.error('Error loading care plans:', error);
        toast.error('Failed to load care plans');
      } finally {
        setIsLoading(false);
      }
    };

    loadCarePlans();
  }, [user, requireAuth]);

  const handleCreatePlan = async (planData: Partial<CarePlan>) => {
    if (!user) return;
    
    try {
      const newPlan = await createCarePlan({
        ...planData,
        family_id: user.id,
      });
      
      setCarePlans((prev) => [...prev, newPlan]);
      setIsCreateFormOpen(false);
      toast.success('Care plan created successfully');
    } catch (error) {
      console.error('Error creating care plan:', error);
      toast.error('Failed to create care plan');
    }
  };

  const handleUpdatePlan = async (planData: Partial<CarePlan>) => {
    if (!selectedCarePlan) return;
    
    try {
      await updateCarePlan(selectedCarePlan.id, planData);
      
      setCarePlans((prev) => 
        prev.map((plan) => 
          plan.id === selectedCarePlan.id ? { ...plan, ...planData } : plan
        )
      );
      
      setSelectedCarePlan(null);
      setIsEditFormOpen(false);
      toast.success('Care plan updated successfully');
    } catch (error) {
      console.error('Error updating care plan:', error);
      toast.error('Failed to update care plan');
    }
  };

  const handleDeletePlan = async (carePlan: CarePlan) => {
    try {
      const success = await deleteCarePlan(carePlan.id);
      
      if (success) {
        setCarePlans((prev) => prev.filter(plan => plan.id !== carePlan.id));
        toast.success('Care plan deleted successfully');
      } else {
        toast.error('Failed to delete care plan');
      }
    } catch (error) {
      console.error('Error deleting care plan:', error);
      toast.error('Failed to delete care plan');
    }
  };

  const handleViewTeam = (carePlan: CarePlan) => {
    navigate(`/dashboard/family/care-plans/${carePlan.id}/team`);
  };

  const handleViewTasks = (carePlan: CarePlan) => {
    navigate(`/dashboard/family/care-plans/${carePlan.id}/tasks`);
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Care Plans</h1>
        <Button 
          onClick={() => setIsCreateFormOpen(true)} 
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Create New Plan
        </Button>
      </div>

      <CarePlanForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSubmit={handleCreatePlan}
        isLoading={isLoading}
      />

      <CarePlanForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        carePlan={selectedCarePlan || undefined}
        onSubmit={handleUpdatePlan}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="text-center py-12">Loading care plans...</div>
      ) : carePlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No care plans yet. Create your first one to start organizing care.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {carePlans.map((plan) => (
            <CarePlanCard 
              key={plan.id} 
              carePlan={plan}
              teamMemberCount={0} // You can implement this later if needed
              taskCount={carePlanTaskCounts[plan.id] || 0}
              onEdit={() => {
                setSelectedCarePlan(plan);
                setIsEditFormOpen(true);
              }}
              onDelete={handleDeletePlan}
              onViewTeam={() => handleViewTeam(plan)}
              onViewTasks={() => handleViewTasks(plan)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarePlansPage;
