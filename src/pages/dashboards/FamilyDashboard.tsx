
import { motion } from "framer-motion";
import { ClipboardList, Users, Calendar, ArrowRight, Bell, Pill, Clock, CalendarCheck, Syringe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const FamilyDashboard = () => {
  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Family Dashboard", link: "/dashboard/family" }
  ];

  const loginUrl = `/auth?returnTo=${encodeURIComponent('/dashboard/family')}`;

  const handleFeatureClick = (featureTitle: string) => {
    toast.info(`${featureTitle} feature coming soon!`, {
      action: {
        label: "Upvote",
        onClick: () => {
          // Navigate to features page handled by Link component
        }
      }
    });
  };

  const QuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start space-x-2"
          onClick={() => handleFeatureClick("Create care plan")}
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
          onClick={() => handleFeatureClick("Add team member")}
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
          onClick={() => handleFeatureClick("Schedule appointment")}
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
          onClick={() => handleFeatureClick("View notifications")}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </Button>
        <UpvoteFeatureButton featureTitle="Notifications Center" className="w-full" />
      </div>
    </div>
  );

  // Removed PreviewBanner since we're not using authentication anymore

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <DashboardHeader 
          breadcrumbItems={breadcrumbItems}
          loginUrl={loginUrl}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mt-2">
            Preview our comprehensive care coordination platform.
          </p>
        </motion.div>

        <QuickActions />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Care Plans Card */}
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
                <Link to="/features">
                  <Button className="w-full">
                    View Plans <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Care Plans Management" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Care Team Card */}
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
                <Link to="/features">
                  <Button className="w-full">
                    View Team <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Care Team Management" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Appointments Card */}
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
                <Link to="/features">
                  <Button className="w-full">
                    View Calendar <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
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
                    <Link to="/features">
                      <Button className="w-full">
                        View {item.title} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
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
      </div>
    </div>
  );
};

export default FamilyDashboard;

