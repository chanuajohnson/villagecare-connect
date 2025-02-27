
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Pill, Clock, Calendar, PenSquare, ChefHat, ActivitySquare } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const FamilyDashboard = () => {
  const breadcrumbItems = [
    {
      label: "Family",
      href: "/dashboard/family",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Medication Management</h1>
        </motion.div>

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
              <Button className="w-full" variant="secondary">
                View Medications
              </Button>
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
              <Button className="w-full" variant="secondary">
                View Schedule
              </Button>
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
              <Button className="w-full" variant="secondary">
                View Planning
              </Button>
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
              <Button className="w-full" variant="secondary">
                View Administration
              </Button>
              <UpvoteFeatureButton featureTitle="Medication Administration" className="w-full" />
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Meal Planning
              </CardTitle>
              <CardDescription>
                Sign up to access our meal planning features and create personalized meal schedules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="secondary">
                Start Planning Meals
              </Button>
              <UpvoteFeatureButton featureTitle="Meal Planning" className="w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Sign up to track your care activities and meal planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="secondary">
                Sign Up to Track Activities
              </Button>
              <UpvoteFeatureButton featureTitle="Activity Tracking" className="w-full" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
