
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { DashboardCaregiverMatches } from "@/components/family/DashboardCaregiverMatches";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { Link } from "react-router-dom";

const FamilyDashboard = () => {
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Family",
      path: "/dashboard/family",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <DashboardHeader 
          breadcrumbItems={breadcrumbItems} 
          actions={
            <Link to="/legacy-stories">
              <Button variant="outline">View Legacy Stories</Button>
            </Link>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Family Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your care coordination and support network.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <FamilyNextStepsPanel />
          </div>
          <div>
            <TellTheirStoryCard />
          </div>
        </div>

        <div className="mb-8">
          <DashboardCaregiverMatches />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CaregiverMatchingCard />
          </div>
          <div>
            <DashboardTracker dashboardType="family">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2">Legacy Stories</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore stories from other families and share your loved one's legacy.
                </p>
                <Link to="/legacy-stories">
                  <Button className="w-full" variant="outline">
                    View Legacy Stories
                  </Button>
                </Link>
              </div>
            </DashboardTracker>
          </div>
        </div>

        <DashboardCardGrid />
      </div>
    </div>
  );
};

export default FamilyDashboard;
