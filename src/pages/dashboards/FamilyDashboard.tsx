
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Pill, Clock, Calendar as CalendarIcon, PenSquare, ChefHat, ActivitySquare, Users, FileText, Bell } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useState } from "react";
import MealTypeSelector from "@/components/meal-planning/components/MealTypeSelector";
import RecipeBrowser from "@/components/meal-planning/RecipeBrowser";

const FamilyDashboard = () => {
  const breadcrumbItems = [{ label: "Family", href: "/dashboard/family" }];
  const [selectedDate, setSelectedDate] = useState<Date>();

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
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
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
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
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
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Meal Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MealTypeSelector
                  selectedMealType={selectedDate ? "breakfast" : ""}
                  setSelectedMealType={() => {}}
                  selectedDate={selectedDate}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Recipe Library
                </CardTitle>
                <CardDescription>Browse and select recipes for your meal plan</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="planner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="planner">Planner</TabsTrigger>
                    <TabsTrigger value="recipes">Recipes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="planner">
                    {selectedDate ? (
                      <div className="space-y-4">
                        <RecipeBrowser
                          category="breakfast"
                          onSelectRecipe={(recipe) => {
                            console.log("Selected recipe:", recipe);
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Please select a date and meal type to start planning
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="recipes">
                    <div className="space-y-4">
                      <RecipeBrowser />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

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
