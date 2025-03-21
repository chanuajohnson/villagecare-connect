
// Import path and related TypeScript errors fixed
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { fetchCarePlans, fetchCareTasks, createCarePlan, updateCarePlan } from '@/services/care-plan-service';
import { CarePlan } from '@/types/care-management';
import { CarePlanCard } from '@/components/family/care-management/CarePlanCard';
import { CarePlanForm } from '@/components/family/care-management/CarePlanForm';

const CarePlansPage = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCarePlan, setSelectedCarePlan] = useState<CarePlan | null>(null);

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
        user_id: user.id,
      });
      
      setCarePlans((prev) => [...prev, newPlan]);
      setIsCreating(false);
      toast.success('Care plan created successfully');
    } catch (error) {
      console.error('Error creating care plan:', error);
      toast.error('Failed to create care plan');
    }
  };

  const handleUpdatePlan = async (planData: Partial<CarePlan>) => {
    if (!selectedCarePlan) return;
    
    try {
      // Only pass the ID and the updates, not the entire care plan
      await updateCarePlan(selectedCarePlan.id, planData);
      
      setCarePlans((prev) => 
        prev.map((plan) => 
          plan.id === selectedCarePlan.id ? { ...plan, ...planData } : plan
        )
      );
      
      setSelectedCarePlan(null);
      toast.success('Care plan updated successfully');
    } catch (error) {
      console.error('Error updating care plan:', error);
      toast.error('Failed to update care plan');
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
          onClick={() => setIsCreating(true)} 
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Create New Plan
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Care Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <CarePlanForm 
              onSubmit={handleCreatePlan} 
              onCancel={() => setIsCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      {selectedCarePlan && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Care Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <CarePlanForm 
              carePlan={selectedCarePlan}
              onSubmit={handleUpdatePlan} 
              onCancel={() => setSelectedCarePlan(null)}
            />
          </CardContent>
        </Card>
      )}

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
              onEdit={() => setSelectedCarePlan(plan)}
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
