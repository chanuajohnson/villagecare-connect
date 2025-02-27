
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";

const ProfessionalDashboard = () => {
  const { user, isProfileComplete } = useAuth();
  
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
          {!user ? (
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg mb-8 border border-teal-100">
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Professional Dashboard! 🏥 Connect, Learn, and Grow.</h2>
              <p className="text-gray-600 mb-4">Caregivers and agencies like you are shaping the future of care. Get hired, track your services, and access professional tools.</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    Complete Your Profile
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    View Jobs
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Access Professional Tools
                  </Button>
                </Link>
              </div>
            </div>
          ) : !isProfileComplete ? (
            <div className="bg-yellow-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 mb-4">Please complete your profile to access all features.</p>
              <Link to="/registration/professional">
                <Button variant="default" size="lg" className="float-right">
                  Complete Profile
                </Button>
              </Link>
            </div>
          ) : null}

          <h1 className="text-3xl font-bold">Professional Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your caregiving services and professional development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {(!user || !isProfileComplete) && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Preview Mode</CardTitle>
                <CardDescription>
                  Sign up to access your personalized dashboard and start coordinating care
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/auth">
                  <Button 
                    variant="default"
                    className="w-full bg-primary hover:bg-primary-600 text-white"
                  >
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="pt-2">
                  <UpvoteFeatureButton
                    featureTitle="Professional Registration"
                    buttonText="Upvote this Feature"
                  />
                </div>
              </CardContent>
            </Card>
          )}

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
