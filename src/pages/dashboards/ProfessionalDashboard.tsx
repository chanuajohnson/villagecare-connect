
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Set up your professional profile to start connecting with families
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                Complete Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Showcase your qualifications and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                Update Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Assistant</CardTitle>
              <CardDescription>
                Streamline your administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm">Get Job Letters</p>
                <p className="text-sm">NIS Registration Assistance</p>
                <p className="text-sm">Document Management</p>
                <p className="text-sm">Administrative Support</p>
              </div>
              <Button className="w-full flex items-center justify-center">
                Access Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
