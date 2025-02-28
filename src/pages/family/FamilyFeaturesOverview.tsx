
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
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

const FamilyFeaturesOverview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <Breadcrumb />
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Family Dashboard Features
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Our family dashboard is designed to help you coordinate care more effectively. 
            Explore the features below, and help us improve by upvoting the ones you'd like to see developed first.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {/* Profile Management Section */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserCog className="h-6 w-6 text-primary" />
                Profile Management
              </CardTitle>
              <CardDescription className="text-base">
                Manage your family's profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Keep your family profile up-to-date to ensure you receive the most relevant care coordination 
                support and recommendations. The profile management feature allows you to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Update contact information for all family members</li>
                <li>Manage privacy settings and data sharing preferences</li>
                <li>Set communication preferences for notifications and reminders</li>
                <li>Customize dashboard appearance and organization</li>
              </ul>
              <p className="text-sm italic mt-4">
                This feature is currently under development and will be available soon.
              </p>
              <Link to="/features">
                <Button className="w-full mt-4">
                  Upvote This Feature
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Care Management Section */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                Care Management
              </CardTitle>
              <CardDescription className="text-base">
                Coordinate care plans, team members, and appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Simplify the complex task of care coordination with our comprehensive care management tools.
                These features help you:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create and manage detailed care plans for family members</li>
                <li>Add and coordinate with care team members, including professionals and community support</li>
                <li>Schedule and track appointments with automatic reminders</li>
                <li>Share care plans securely with authorized healthcare providers</li>
                <li>Track progress against care goals with simple visualizations</li>
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Care Plans
                  </h4>
                  <p className="text-sm text-gray-600">Create and manage personalized care plans</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Care Team
                  </h4>
                  <p className="text-sm text-gray-600">Coordinate with healthcare providers and caregivers</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Appointments
                  </h4>
                  <p className="text-sm text-gray-600">Schedule and track all care-related appointments</p>
                </div>
              </div>
              <p className="text-sm italic mt-4">
                This feature is currently under development and will be available soon.
              </p>
              <Link to="/features">
                <Button className="w-full mt-4">
                  Upvote This Feature
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Medication Management Section */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Pill className="h-6 w-6 text-primary" />
                Medication Management
              </CardTitle>
              <CardDescription className="text-base">
                Track and manage medications, schedules, and administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our medication management tools help you stay on top of complex medication regimens
                for your family members:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create detailed medication lists with dosage information</li>
                <li>Set up medication schedules with customizable reminders</li>
                <li>Track administration and adherence over time</li>
                <li>Monitor for potential drug interactions</li>
                <li>Generate medication reports for healthcare providers</li>
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Medication List
                  </h4>
                  <p className="text-sm text-gray-600">Maintain a comprehensive list of medications</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Medication Schedule
                  </h4>
                  <p className="text-sm text-gray-600">Set up and manage medication schedules</p>
                </div>
              </div>
              <p className="text-sm italic mt-4">
                This feature is currently under development and will be available soon.
              </p>
              <Link to="/features">
                <Button className="w-full mt-4">
                  Upvote This Feature
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Meal Planning Section */}
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ChefHat className="h-6 w-6 text-primary" />
                Meal Planning
              </CardTitle>
              <CardDescription className="text-base">
                Plan and manage meals, recipes, and nutrition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Simplify meal planning while ensuring nutritional needs are met with our comprehensive
                meal planning tools:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create weekly meal plans customized to dietary needs</li>
                <li>Access a recipe library with nutrition information</li>
                <li>Generate shopping lists based on meal plans</li>
                <li>Schedule meal preparation tasks and reminders</li>
                <li>Track nutrition intake and dietary adherence</li>
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Meal Calendar
                  </h4>
                  <p className="text-sm text-gray-600">Plan meals on a weekly or monthly calendar</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    Recipe Library
                  </h4>
                  <p className="text-sm text-gray-600">Browse and save nutritious recipes</p>
                </div>
              </div>
              <p className="text-sm italic mt-4">
                This feature is currently under development and will be available soon.
              </p>
              <Link to="/features">
                <Button className="w-full mt-4">
                  Upvote This Feature
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-xl border border-blue-100 text-center shadow-sm max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4">Help Shape the Future of Care Coordination</h2>
          <p className="text-gray-700 mb-6">
            We're building Takes a Village with families like yours in mind. Your feedback helps us
            prioritize which features to develop first. Visit our Features page to vote for the
            functionality that would most benefit your family's care coordination needs.
          </p>
          <Link to="/features">
            <Button size="lg" className="font-semibold">
              Upvote Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyFeaturesOverview;
