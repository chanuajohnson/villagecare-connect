
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
          <h1 className="text-3xl font-bold">Family Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Complete your registration to start connecting with care providers.
          </p>
        </motion.div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Set up your family profile to start connecting with care providers
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
              <CardTitle>Find Care Providers</CardTitle>
              <CardDescription>
                Search and connect with qualified care providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                Search Providers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Care Planning</CardTitle>
              <CardDescription>
                Create and manage care plans for your loved ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                Start Planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
