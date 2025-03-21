
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CaregiverMatchingCard } from "@/components/professional/CaregiverMatchingCard";
import { TrainingProgramSection } from "@/components/professional/TrainingProgramSection";
import { NextStepsPanel } from "@/components/professional/NextStepsPanel";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { getUserRole } from "@/lib/supabase";
import { CarePlansAccess } from "@/components/professional/CarePlansAccess";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Professional",
      path: "/dashboard/professional",
    },
  ];

  useEffect(() => {
    // Set some completed steps for demonstration
    setCompletedSteps(["profile", "certification"]);
    
    // Verify the user has the correct role
    const checkRole = async () => {
      if (user) {
        const role = await getUserRole();
        if (role && role !== "professional" && role !== "admin") {
          // Redirect to appropriate dashboard based on role
          if (role === "family") {
            navigate("/dashboard/family");
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

        <DashboardTracker currentPage="professional_dashboard" />
        <MatchingTracker currentPage="professional_dashboard" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your caregiving opportunities and professional development.</p>
        </motion.div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CaregiverMatchingCard />
          </div>
          <div>
            <NextStepsPanel completedSteps={completedSteps} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CarePlansAccess />
          </div>
          <div>
            <TrainingProgramSection />
          </div>
        </div>
      </div>
    </div>
  );
}
