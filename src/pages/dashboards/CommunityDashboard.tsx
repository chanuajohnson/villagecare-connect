
import { motion } from "framer-motion";
import { Users, Heart, Calendar, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const CommunityDashboard = () => {
  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Community Dashboard", link: "/dashboard/community" }
  ];

  const loginUrl = `/auth?returnTo=${encodeURIComponent('/dashboard/community')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <DashboardHeader 
          breadcrumbItems={breadcrumbItems}
          loginUrl={loginUrl}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
          <p className="text-gray-600 mt-2">Connect and contribute to your local care community.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Join Care Circles</CardTitle>
                <CardDescription>Connect with families and other community members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/features">
                  <Button className="w-full">
                    Find Circles <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Care Circles" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Community Events</CardTitle>
                <CardDescription>Discover and participate in local care events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/features">
                  <Button className="w-full">
                    View Events <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Community Events" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Support Network</CardTitle>
                <CardDescription>Offer and receive community support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/features">
                  <Button className="w-full">
                    Get Involved <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Support Network" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;

