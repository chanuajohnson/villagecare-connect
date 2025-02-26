
import { motion } from "framer-motion";
import { ClipboardList, Users, Calendar, ArrowRight, Bell, Pill, Clock, CalendarCheck, Syringe, Home } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import MealPlanner from "@/components/meal-planning/MealPlanner";
import { useEffect, useState } from "react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";

const FamilyDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleFeatureClick = (featureTitle: string) => {
    if (!session) {
      navigate("/auth");
      return;
    }
    toast.info(`${featureTitle} feature coming soon!`, {
      action: {
        label: "Upvote",
        onClick: () => navigate("/features")
      }
    });
  };

  const QuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start space-x-2"
          onClick={() => session ? toast.info("Create care plan coming soon!") : navigate("/auth")}
        >
          <ClipboardList className="w-4 h-4" />
          <span>New Care Plan</span>
        </Button>
        <UpvoteFeatureButton featureTitle="New Care Plan Creation" className="w-full" />
      </div>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start space-x-2"
          onClick={() => session ? toast.info("Add team member coming soon!") : navigate("/auth")}
        >
          <Users className="w-4 h-4" />
          <span>Add Team Member</span>
        </Button>
        <UpvoteFeatureButton featureTitle="Team Member Addition" className="w-full" />
      </div>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start space-x-2"
          onClick={() => session ? toast.info("Schedule appointment coming soon!") : navigate("/auth")}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Appointment</span>
        </Button>
        <UpvoteFeatureButton featureTitle="Appointment Scheduling" className="w-full" />
      </div>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start space-x-2"
          onClick={() => session ? toast.info("View notifications coming soon!") : navigate("/auth")}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </Button>
        <UpvoteFeatureButton featureTitle="Notifications Center" className="w-full" />
      </div>
    </div>
  );

  const PreviewBanner = () => (
    <div className="bg-primary/10 p-4 rounded-lg mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">Preview Mode</h3>
          <p className="text-sm text-gray-600">Sign up to access your personalized dashboard and start coordinating care.</p>
        </div>
        <Link to="/auth">
          <Button>
            Sign Up Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <Breadcrumb />
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          {session ? (
            <Button 
              variant="outline" 
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/", { replace: true });
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>

        {!session && <PreviewBanner />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mt-2">
            {session ? "Manage your care plans and coordinate with your care team." : "Preview our comprehensive care coordination platform."}
          </p>
        </motion.div>

        {!session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
                <CardDescription>Create your account to access all features and start coordinating care</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth">
                  <Button className="w-full">
                    Create Account <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => !session && navigate("/auth")}
                >
                  View Plans <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <UpvoteFeatureButton featureTitle="Care Plans Management" className="w-full" />
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
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => !session && navigate("/auth")}
                >
                  View Team <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <UpvoteFeatureButton featureTitle="Care Team Management" className="w-full" />
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
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => !session && navigate("/auth")}
                >
                  View Calendar <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <UpvoteFeatureButton featureTitle="Appointment Calendar" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Medication Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Medications", icon: Pill, description: "View and manage medications" },
              { title: "Schedule", icon: Clock, description: "Manage medication schedules" },
              { title: "Planning", icon: CalendarCheck, description: "Plan medication routines" },
              { title: "Administration", icon: Syringe, description: "Track medication administration" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card>
                  <CardHeader>
                    <div className="mb-4">
                      <item.icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full" 
                      variant="default"
                      onClick={() => handleFeatureClick(item.title)}
                    >
                      View {item.title} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <UpvoteFeatureButton 
                      featureTitle={`${item.title} Management`}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Meal Planning</h2>
          {session ? (
            <MealPlanner userId={session.user.id} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Meal Planning</CardTitle>
                <CardDescription>Sign up to access our meal planning features and create personalized meal schedules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/auth">
                  <Button className="w-full">
                    Start Planning Meals <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Meal Planning Features" className="w-full" />
              </CardContent>
            </Card>
          )}
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
              <CardDescription>
                {session 
                  ? "Latest updates from your care plans and meal activities" 
                  : "Sign up to track your care activities and meal planning"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session ? (
                <p className="text-gray-500">No recent activities</p>
              ) : (
                <>
                  <Link to="/auth">
                    <Button className="w-full">
                      Sign Up to Track Activities <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <UpvoteFeatureButton featureTitle="Activity Tracking" className="w-full" />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
