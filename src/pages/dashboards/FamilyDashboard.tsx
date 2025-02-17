
import { motion } from "framer-motion";
import { ClipboardList, Users, Calendar, ArrowRight, Bell, PlusCircle, Pill } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const FamilyDashboard = () => {
  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Fetch care plans only if Supabase is configured
  const { data: carePlans, isLoading: carePlansLoading } = useQuery({
    queryKey: ['carePlans'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('care_plans')
        .select(`
          *,
          care_tasks (*)
        `)
        .eq('status', 'active');
      
      if (error) {
        toast.error("Failed to load care plans");
        throw error;
      }
      return data;
    }
  });

  // Quick Actions Section
  const QuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Button 
        variant="outline" 
        className="justify-start space-x-2"
        onClick={() => toast.info("Create care plan coming soon!")}
      >
        <PlusCircle className="w-4 h-4" />
        <span>New Care Plan</span>
      </Button>
      <Button 
        variant="outline" 
        className="justify-start space-x-2"
        onClick={() => toast.info("Add medication coming soon!")}
      >
        <Pill className="w-4 h-4" />
        <span>Add Medication</span>
      </Button>
      <Button 
        variant="outline" 
        className="justify-start space-x-2"
        onClick={() => toast.info("Add task coming soon!")}
      >
        <ClipboardList className="w-4 h-4" />
        <span>New Task</span>
      </Button>
      <Button 
        variant="outline" 
        className="justify-start space-x-2"
        onClick={() => toast.info("View notifications coming soon!")}
      >
        <Bell className="w-4 h-4" />
        <span>Notifications</span>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mt-2">Manage your care plans and coordinate with your care team.</p>
          {!isSupabaseConfigured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                Please connect to Supabase to enable all features.
              </p>
            </div>
          )}
        </motion.div>

        <QuickActions />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <ClipboardList className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Care Plans</CardTitle>
                <CardDescription>
                  {carePlansLoading 
                    ? "Loading care plans..." 
                    : `${carePlans?.length || 0} active care plans`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Manage Plans <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Care Team</CardTitle>
                <CardDescription>Manage your care team and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  View Team <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Pill className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Medications</CardTitle>
                <CardDescription>Track and manage medications</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  View Schedule <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your care team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carePlansLoading ? (
                  <p className="text-gray-500">Loading activities...</p>
                ) : carePlans?.length === 0 ? (
                  <p className="text-gray-500">No recent activities</p>
                ) : (
                  <div className="space-y-4">
                    {carePlans?.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{plan.title}</p>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
