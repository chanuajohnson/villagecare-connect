
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompleteTracker } from "@/components/tracking/CompleteTracker";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Admin",
      path: "/dashboard/admin",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <CompleteTracker
        pageTracking={{ actionType: "admin_dashboard_view" }}
        journeyTracking={{ journeyStage: "active_usage" }}
      />
      
      <div className="container px-4 py-8">
        <DashboardHeader
          breadcrumbItems={breadcrumbItems}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage system settings and user accounts.</p>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => navigate("/admin/journey-analytics")}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                User Journey Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track user journeys across the platform and analyze user behavior patterns.
              </CardDescription>
              <Button 
                variant="link" 
                className="px-0 mt-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/journey-analytics");
                }}
              >
                View Analytics →
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <LineChart className="h-5 w-5 mr-2 text-green-500" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review user engagement statistics and conversion rates.
              </CardDescription>
              <Button variant="link" className="px-0 mt-2">Coming Soon →</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="h-5 w-5 mr-2 text-purple-500" />
                Revenue Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track subscription revenues and payment statistics.
              </CardDescription>
              <Button variant="link" className="px-0 mt-2">Coming Soon →</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <AdminUserManagement />
          
          <div className="mt-8">
            <FeatureInterestTracker />
          </div>

          <DashboardCardGrid />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
