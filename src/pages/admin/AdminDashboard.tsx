
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { UnverifiedUserManagement } from "@/components/admin/UnverifiedUserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
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
          
          {/* Public access notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Public Access Mode:</strong> This admin dashboard is currently publicly accessible for demonstration purposes.
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Active Users</TabsTrigger>
              <TabsTrigger value="unverified">Unverified Users</TabsTrigger>
              <TabsTrigger value="features">Feature Tracking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>
            
            <TabsContent value="unverified">
              <UnverifiedUserManagement />
            </TabsContent>
            
            <TabsContent value="features">
              <FeatureInterestTracker />
            </TabsContent>
          </Tabs>

          <DashboardCardGrid />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
