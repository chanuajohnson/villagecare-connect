import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { FileText, Plus, Users, Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const CareManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCarePlans();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCarePlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('family_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCarePlans(data || []);
    } catch (error) {
      console.error("Error fetching care plans:", error);
      toast.error("Failed to load care plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    navigate("/family/care-management/create");
  };

  const handleViewPlan = (planId) => {
    navigate(`/family/care-management/${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_dashboard_view" additionalData={{ section: "care_management" }} />
      
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/dashboard/family")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Care Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage care plans for your loved ones
              </p>
            </div>
            
            <Button onClick={handleCreatePlan}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : carePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carePlans.map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewPlan(plan.id)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {plan.title}
                  </CardTitle>
                  <CardDescription>
                    {plan.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>Status: <span className={`font-medium ${plan.status === 'active' ? 'text-green-600' : plan.status === 'completed' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span></div>
                    <div>Updated: {new Date(plan.updated_at).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>No Care Plans Found</CardTitle>
              <CardDescription>
                You haven't created any care plans yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Create your first care plan to start managing care for your loved one.</p>
              <Button onClick={handleCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Plan
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Care Plans
              </CardTitle>
              <CardDescription>Manage all care plans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create and manage detailed care plans for your loved ones.
              </p>
              <Button variant="secondary" className="w-full" onClick={handleCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Care Team
              </CardTitle>
              <CardDescription>Manage team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add and manage caregivers and other members of your care team.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate("/family/care-management/team")}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
              <CardDescription>Manage care calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule appointments, tasks, and manage care shifts.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate("/family/care-management/schedule")}
              >
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default CareManagementPage;
