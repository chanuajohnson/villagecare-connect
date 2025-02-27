
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CommunityDashboard = () => {
  const breadcrumbItems = [
    {
      label: "Community",
      href: "/dashboard/community",
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
          <h1 className="text-3xl font-bold">Community Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Connect and contribute to your local care community.
          </p>
        </motion.div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Set up your community profile to start supporting families
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
              <CardTitle>Join Care Circles</CardTitle>
              <CardDescription>
                Connect with families and other community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                Find Circles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Events</CardTitle>
              <CardDescription>
                Discover and participate in local care events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                View Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Network</CardTitle>
              <CardDescription>
                Offer and receive community support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center justify-center">
                Get Involved
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
