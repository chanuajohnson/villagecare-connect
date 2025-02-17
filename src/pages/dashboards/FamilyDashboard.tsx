
import { motion } from "framer-motion";
import { ClipboardList, Users, Calendar, ArrowRight, Bell, PlusCircle, Pill, Utensils, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

const FamilyDashboard = () => {
  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Fetch meal plans
  const { data: mealPlans, isLoading: mealPlansLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            *,
            recipe: recipes (*)
          )
        `)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      
      if (error) {
        toast.error("Failed to load meal plans");
        throw error;
      }
      return data || [];
    }
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from('prepped_meal_orders')
        .select(`
          *,
          recipe: recipes (*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        toast.error("Failed to load recent orders");
        throw error;
      }
      return data || [];
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
        <ClipboardList className="w-4 h-4" />
        <span>New Care Plan</span>
      </Button>
      <Button 
        variant="outline" 
        className="justify-start space-x-2"
        onClick={() => toast.info("Add team member coming soon!")}
      >
        <Users className="w-4 h-4" />
        <span>Add Team Member</span>
      </Button>
      <Button 
        variant="outline" 
        className="justify-start space-x-2"
        onClick={() => toast.info("Schedule appointment coming soon!")}
      >
        <Calendar className="w-4 h-4" />
        <span>Schedule Appointment</span>
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
                <CardDescription>View and manage care plans</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  View Plans <ArrowRight className="ml-2 w-4 h-4" />
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
                <CardDescription>Manage your care team members</CardDescription>
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
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  View Calendar <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Meal Planning Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Meal Planning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="mb-4">
                    <Calendar className="w-8 h-8 text-primary-600" />
                  </div>
                  <CardTitle>Meal Plans</CardTitle>
                  <CardDescription>
                    {mealPlansLoading 
                      ? "Loading meal plans..." 
                      : `${mealPlans?.length || 0} upcoming meal plans`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => toast.info("Meal plans coming soon!")}>
                    View Plans <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
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
                    <Utensils className="w-8 h-8 text-primary-600" />
                  </div>
                  <CardTitle>Recipes</CardTitle>
                  <CardDescription>Browse and save your favorite recipes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => toast.info("Recipe browser coming soon!")}>
                    View Recipes <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
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
                    <ShoppingCart className="w-8 h-8 text-primary-600" />
                  </div>
                  <CardTitle>Prepped Meals</CardTitle>
                  <CardDescription>Order meals from our community</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => toast.info("Meal ordering coming soon!")}>
                    Order Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
              <CardDescription>Latest updates from your care plans and meal activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersLoading ? (
                  <p className="text-gray-500">Loading activities...</p>
                ) : recentOrders?.length === 0 ? (
                  <p className="text-gray-500">No recent activities</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders?.map((order) => (
                      <div key={order.id} className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Ordered {order.quantity}x {order.recipe.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Delivery on {format(new Date(order.delivery_date), 'MMM d, yyyy')}
                          </p>
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
