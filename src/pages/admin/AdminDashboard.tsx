
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

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

  const careManagementCards = [
    {
      title: "Care Plans",
      description: "Manage and review care plans across the platform",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      path: "/dashboard/admin/care-plans",
    },
    {
      title: "Care Teams",
      description: "View all authorized caregiver relationships",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      path: "/dashboard/admin/care-teams",
    },
    {
      title: "Care Scheduling",
      description: "Oversee shift scheduling and calendar integration",
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      path: "/dashboard/admin/care-scheduling",
    },
    {
      title: "Care Analytics",
      description: "View care management usage and metrics",
      icon: <BarChart3 className="h-6 w-6 text-amber-600" />,
      path: "/dashboard/admin/care-analytics",
    }
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
        </motion.div>

        <div className="space-y-8">
          <AdminUserManagement />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Care Management System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {careManagementCards.map((card, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      {card.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="default" className="w-full">
                      <Link to={card.path}>
                        View {card.title}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

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
