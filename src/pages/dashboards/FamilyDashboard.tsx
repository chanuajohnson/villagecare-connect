
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Pill, Clock, Calendar as CalendarIcon, PenSquare, ChefHat, ActivitySquare, Users, FileText, Bell } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

const FamilyDashboard = () => {
  const breadcrumbItems = [{ label: "Family", href: "/dashboard/family" }];
  const [dates, setDates] = useState<{ [key: string]: Date | undefined }>({});

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
            <h2 className="text-xl font-semibold mb-2">Preview Mode</h2>
            <p className="text-gray-600 mb-4">Sign up to access your personalized dashboard and start coordinating care.</p>
            <Button variant="default" size="lg" className="float-right">
              Sign Up Now
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-4">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mb-8">Preview our comprehensive care coordination platform.</p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Get Started Today</CardTitle>
              <CardDescription>Create your account to access all features and start coordinating care</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full mb-4">Create Account</Button>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Select date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dates['schedule']}
                      onSelect={(date) => setDates(prev => ({ ...prev, schedule: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <UpvoteFeatureButton featureTitle="Schedule Appointment" className="w-full mt-4" />
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
                <Button className="w-full" variant="secondary">View Plans</Button>
                <UpvoteFeatureButton featureTitle="Care Plans Management" className="w-full" />
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
                <Button className="w-full" variant="secondary">View Team</Button>
                <UpvoteFeatureButton featureTitle="Care Team Management" className="w-full" />
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Select date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dates['appointments']}
                      onSelect={(date) => setDates(prev => ({ ...prev, appointments: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button className="w-full mt-4" variant="secondary">View Calendar</Button>
                <UpvoteFeatureButton featureTitle="Appointments Management" className="w-full" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-6">Medication Management</h2>
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
                <Button className="w-full" variant="secondary">View Medications</Button>
                <UpvoteFeatureButton featureTitle="Medications Management" className="w-full" />
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
                <Button className="w-full" variant="secondary">View Schedule</Button>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Select date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dates['planning']}
                      onSelect={(date) => setDates(prev => ({ ...prev, planning: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button className="w-full mt-4" variant="secondary">View Planning</Button>
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
                <Button className="w-full" variant="secondary">View Administration</Button>
                <UpvoteFeatureButton featureTitle="Medication Administration" className="w-full" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-6">Meal Planning</h2>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Meal Planning</CardTitle>
              <CardDescription>Sign up to access our meal planning features and create personalized meal schedules.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full mb-4">Start Planning Meals</Button>
              <UpvoteFeatureButton featureTitle="Meal Planning" className="w-full" />
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Sign up to track your care activities and meal planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="secondary">Sign Up to Track Activities</Button>
              <UpvoteFeatureButton featureTitle="Recent Activity" className="w-full" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;

