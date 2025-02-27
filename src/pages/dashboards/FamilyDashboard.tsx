
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Calendar, PenSquare, ChefHat, ActivitySquare, Users, Bell, Pill } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const FamilyDashboard = () => {
  const breadcrumbItems = [{ label: "Family", href: "/dashboard/family" }];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl mb-2">Preview Mode</h2>
            <p className="text-gray-600 mb-4">Sign up to access your personalized dashboard and start coordinating care.</p>
            <Button variant="default" size="lg" className="float-right">
              Sign Up Now
            </Button>
          </div>

          <h1 className="text-3xl font-semibold mb-4">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mb-8">Preview our comprehensive care coordination platform.</p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Get Started Today</CardTitle>
              <CardDescription>Create your account to access all features and start coordinating care</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full">Create Account</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  New Care Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpvoteFeatureButton featureTitle="New Care Plan" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpvoteFeatureButton featureTitle="Add Team Member" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpvoteFeatureButton featureTitle="Schedule Appointment" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpvoteFeatureButton featureTitle="Notifications" className="w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Care Plans
                </CardTitle>
                <CardDescription>View and manage care plans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Plans</Button>
                <UpvoteFeatureButton featureTitle="Care Plans" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Care Team
                </CardTitle>
                <CardDescription>Manage your care team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Team</Button>
                <UpvoteFeatureButton featureTitle="Care Team" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Appointments
                </CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Calendar</Button>
                <UpvoteFeatureButton featureTitle="Appointments" className="w-full" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Medication Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Medications
                </CardTitle>
                <CardDescription>View and manage medications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Medications</Button>
                <UpvoteFeatureButton featureTitle="Medications" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Schedule
                </CardTitle>
                <CardDescription>Manage medication schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Schedule</Button>
                <UpvoteFeatureButton featureTitle="Medication Schedule" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Planning
                </CardTitle>
                <CardDescription>Plan medication routines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Planning</Button>
                <UpvoteFeatureButton featureTitle="Medication Planning" className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5 text-primary" />
                  Administration
                </CardTitle>
                <CardDescription>Track medication administration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Administration</Button>
                <UpvoteFeatureButton featureTitle="Medication Administration" className="w-full" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Meal Planning</h2>
          <div className="bg-white rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Meal Planner</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Select Date</h4>
                    <p className="text-gray-600 text-sm">Pick a date</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Meal Types</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Morning Drink</p>
                    <p className="text-gray-600">Morning Snack</p>
                    <p className="text-gray-600">Afternoon Snack</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Breakfast</p>
                    <p className="text-gray-600">Lunch</p>
                    <p className="text-gray-600">Dinner</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-gray-600">Plan meals for the whole family</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-gray-600">Browse recipe suggestions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-gray-600">Track nutritional information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-gray-600">Generate shopping lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-gray-600">Share plans with care team</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your care plans and meal activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent activities</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
