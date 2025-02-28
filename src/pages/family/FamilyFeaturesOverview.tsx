
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  Calendar, 
  Pill, 
  Clock, 
  ChefHat, 
  UserCog,
  ArrowRight
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const FamilyFeaturesOverview = () => {
  const breadcrumbItems = [
    {
      label: "Family",
      href: "/dashboard/family",
    },
    {
      label: "Features Overview",
      href: "/family/features-overview",
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
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold">Family Features Overview</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            Our family dashboard is designed to help you coordinate care more effectively. 
            Explore the features below, and help us improve by upvoting the ones you'd like to see developed first.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {/* Profile Management */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Profile Management
                </CardTitle>
                <CardDescription>
                  Manage your family's profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Keep your family profile up-to-date to ensure you receive the most relevant care coordination 
                    support and recommendations. The profile management feature allows you to:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Update contact information for all family members</li>
                    <li className="text-sm text-gray-600">Manage privacy settings and data sharing preferences</li>
                    <li className="text-sm text-gray-600">Set communication preferences for notifications and reminders</li>
                    <li className="text-sm text-gray-600">Customize dashboard appearance and organization</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700 font-medium">Status: In Development</p>
                <Link to="/features">
                  <Button 
                    variant="default"
                    className="w-full mt-2 bg-primary hover:bg-primary-600 text-white"
                  >
                    Upvote This Feature
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Care Management */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Care Management
                </CardTitle>
                <CardDescription>
                  Coordinate care plans, team members, and appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Simplify the complex task of care coordination with our comprehensive care management tools.
                    These features help you:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Create and manage detailed care plans for family members</li>
                    <li className="text-sm text-gray-600">Add and coordinate with care team members, including professionals and community support</li>
                    <li className="text-sm text-gray-600">Schedule and track appointments with automatic reminders</li>
                    <li className="text-sm text-gray-600">Share care plans securely with authorized healthcare providers</li>
                    <li className="text-sm text-gray-600">Track progress against care goals with simple visualizations</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Care Plans
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Create and manage personalized care plans</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Care Team
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Coordinate with healthcare providers and caregivers</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Appointments
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Schedule and track all care-related appointments</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 font-medium">Status: In Development</p>
                <Link to="/features">
                  <Button 
                    variant="default"
                    className="w-full mt-2 bg-primary hover:bg-primary-600 text-white"
                  >
                    Upvote This Feature
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medication Management */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medication Management
                </CardTitle>
                <CardDescription>
                  Track and manage medications, schedules, and administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Our medication management tools help you stay on top of complex medication regimens
                    for your family members:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Create detailed medication lists with dosage information</li>
                    <li className="text-sm text-gray-600">Set up medication schedules with customizable reminders</li>
                    <li className="text-sm text-gray-600">Track administration and adherence over time</li>
                    <li className="text-sm text-gray-600">Monitor for potential drug interactions</li>
                    <li className="text-sm text-gray-600">Generate medication reports for healthcare providers</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      Medication List
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Maintain a comprehensive list of medications</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Medication Schedule
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Set up and manage medication schedules</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 font-medium">Status: In Development</p>
                <Link to="/features">
                  <Button 
                    variant="default"
                    className="w-full mt-2 bg-primary hover:bg-primary-600 text-white"
                  >
                    Upvote This Feature
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Meal Planning */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Meal Planning
                </CardTitle>
                <CardDescription>
                  Plan and manage meals, recipes, and nutrition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    Simplify meal planning while ensuring nutritional needs are met with our comprehensive
                    meal planning tools:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Create weekly meal plans customized to dietary needs</li>
                    <li className="text-sm text-gray-600">Access a recipe library with nutrition information</li>
                    <li className="text-sm text-gray-600">Generate shopping lists based on meal plans</li>
                    <li className="text-sm text-gray-600">Schedule meal preparation tasks and reminders</li>
                    <li className="text-sm text-gray-600">Track nutrition intake and dietary adherence</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Meal Calendar
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Plan meals on a weekly or monthly calendar</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-primary" />
                      Recipe Library
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">Browse and save nutritious recipes</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 font-medium">Status: Planned</p>
                <Link to="/features">
                  <Button 
                    variant="default"
                    className="w-full mt-2 bg-primary hover:bg-primary-600 text-white"
                  >
                    Upvote This Feature
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Want to see these features developed sooner? Let us know what's important to you!</p>
            <Link to="/features">
              <Button 
                variant="default"
                className="bg-primary hover:bg-primary-600 text-white"
              >
                Vote for Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyFeaturesOverview;
