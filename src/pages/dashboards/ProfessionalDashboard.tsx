
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";

const ProfessionalDashboard = () => {
  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Professional Dashboard", link: "/dashboard/professional" }
  ];

  const loginUrl = `/auth?returnTo=${encodeURIComponent('/dashboard/professional')}`;

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
          <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your caregiving services and professional development.</p>
        </motion.div>

        <DashboardCardGrid session={undefined} />
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
