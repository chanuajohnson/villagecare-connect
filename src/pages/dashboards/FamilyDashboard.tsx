import { motion } from "framer-motion";
import { ClipboardList, Users, Calendar, ArrowRight, Bell, Home } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import MealPlanner from "@/components/meal-planning/MealPlanner";
import { useEffect, useState } from "react";

const FamilyDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast.error("Please login to access the dashboard");
        navigate("/auth", { replace: true });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

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
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Button 
            variant="outline" 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/", { replace: true });
            }}
          >
            Sign Out
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mt-2">Manage your care plans and coordinate with your care team.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>Set up your family profile to start coordinating care</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button className="w-full">
                  Complete Registration <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
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
                <Button className="w-full" variant="default">
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
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Care Team</CardTitle>
                <CardDescription>Manage your care team members</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  View Team <ArrowRight className="ml-2 w-4 h-4" />
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
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  View Calendar <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Meal Planning</h2>
          {session && <MealPlanner userId={session.user.id} />}
        </div>

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
              <p className="text-gray-500">No recent activities</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
