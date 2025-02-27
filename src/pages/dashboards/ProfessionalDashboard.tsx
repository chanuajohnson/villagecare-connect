
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const ProfessionalDashboard = () => {
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Professional Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your caregiving services and professional development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Set up your professional profile to start connecting with families
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-600 text-white"
              >
                Complete Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="pt-2">
                <UpvoteFeatureButton
                  featureTitle="Professional Registration"
                  buttonText="Upvote this Feature"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Admin Assistant</CardTitle>
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
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-600 text-white"
              >
                Access Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Showcase your qualifications and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-600 text-white"
              >
                Update Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="pt-2">
                <UpvoteFeatureButton
                  featureTitle="Professional Profile"
                  buttonText="Upvote this Feature"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Training Resources</CardTitle>
              <CardDescription>
                Access our comprehensive library of caregiving resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-600 text-white"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="pt-2">
                <UpvoteFeatureButton
                  featureTitle="Training Resources"
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
