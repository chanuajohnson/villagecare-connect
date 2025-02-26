
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";

const CommunityDashboard = () => {
  const breadcrumbItems = [
    {
      label: "Community",
      href: "/dashboard/community",
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
          <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
          <p className="text-gray-600 mt-2">Connect and engage with your care community.</p>
        </motion.div>

        <DashboardCardGrid />
      </div>
    </div>
  );
};

export default CommunityDashboard;
