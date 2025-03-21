
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { DashboardRegistrationCard } from "@/components/dashboard/DashboardRegistrationCard";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { DashboardCaregiverMatches } from "@/components/family/DashboardCaregiverMatches";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { CareManagementCard } from "@/components/family/CareManagementCard";
import { getUserRole } from "@/lib/supabase";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

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

  useEffect(() => {
    // Set some completed steps for demonstration
    setCompletedSteps(["profile", "needs"]);
    
    // Verify the user has the correct role
    const checkRole = async () => {
      if (user) {
        const role = await getUserRole();
        if (role && role !== "family" && role !== "admin") {
          // Redirect to appropriate dashboard based on role
          if (role === "professional") {
            navigate("/dashboard/professional");
          } else if (role === "community") {
            navigate("/dashboard/community");
          }
        }
      }
    };
    
    checkRole();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <DashboardHeader
          breadcrumbItems={breadcrumbItems}
        />

        <DashboardTracker currentPage="family_dashboard" />
        <MatchingTracker currentPage="family_dashboard" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Family Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your care coordination and find qualified caregivers.</p>
        </motion.div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CaregiverMatchingCard />
          </div>
          <div>
            <DashboardRegistrationCard
              userType="family"
              completedSteps={completedSteps}
              totalSteps={4}
              registrationPath="/register/family"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CareManagementCard />
          </div>
          <div>
            <FamilyNextStepsPanel completedSteps={completedSteps} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <DashboardCaregiverMatches />
          </div>
          <div>
            <TellTheirStoryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
