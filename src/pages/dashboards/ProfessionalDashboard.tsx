
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UserCog, BookOpen, Building } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  
  const breadcrumbItems = [
    {
      label: "Professional",
      href: "/dashboard/professional",
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
          <h1 className="text-3xl font-bold">Professional Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your caregiving services and professional development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Profile Management
              </CardTitle>
              <CardDescription>
                Manage your professional profile and qualifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Update Personal Information</p>
                <p className="text-sm text-gray-600">Manage Professional Credentials</p>
                <p className="text-sm text-gray-600">Update Skills & Experience</p>
                <p className="text-sm text-gray-600">Set Availability & Preferences</p>
              </div>
              <Link to="/professional/features-overview">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  Manage Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Professional Profile Management"
                  buttonText="Upvote this Feature"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Assistant
              </CardTitle>
              <CardDescription>
                Streamline your administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Get Job Letters</p>
                <p className="text-sm text-gray-600">NIS Registration Assistance</p>
                <p className="text-sm text-gray-600">Document Management</p>
                <p className="text-sm text-gray-600">Administrative Support</p>
              </div>
              <Link to="/professional/features-overview">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  Access Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Admin Assistant Tools"
                  buttonText="Upvote this Feature"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Training Resources
              </CardTitle>
              <CardDescription>
                Access our comprehensive library of caregiving resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-4 text-left">
                <p className="text-sm text-gray-600">Certification Courses</p>
                <p className="text-sm text-gray-600">Skill Development</p>
                <p className="text-sm text-gray-600">Best Practices Guides</p>
                <p className="text-sm text-gray-600">Specialized Care Training</p>
              </div>
              <Link to="/professional/features-overview">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Training Resources"
                  buttonText="Upvote this Feature"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Professional Agency
              </CardTitle>
              <CardDescription>
                Agency management features for professional caregivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 text-left">
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Professional Dashboard (Agency)</h4>
                  <p className="text-xs text-gray-600 mt-1">A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Access Professional Tools</h4>
                  <p className="text-xs text-gray-600 mt-1">A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Agency Training & Development Hub</h4>
                  <p className="text-xs text-gray-600 mt-1">A training center for agencies offering certifications, compliance training, and workforce development.</p>
                  <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
                </div>
              </div>
              
              <Link to="/professional/features-overview">
                <Button 
                  variant="default"
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  Learn About Agency Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <div className="pt-4">
                <UpvoteFeatureButton
                  featureTitle="Professional Agency Management"
                  buttonText="Upvote this Feature"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
