
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { CaregiverMatchingCard } from "@/components/professional/CaregiverMatchingCard";
import { TrainingProgramSection } from "@/components/professional/TrainingProgramSection";
import { NextStepsPanel } from "@/components/professional/NextStepsPanel";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { getUserRole } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Clipboard, ArrowRight } from "lucide-react";

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

        {/* Care Plans Access Button */}
        <div className="mb-8">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboard/family/care-plans")}
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Access Family Care Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            View and manage care plans that families have shared with you
          </p>
        </div>

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
            <DashboardCardGrid />
          </div>
          <div>
            <TrainingProgramSection />
          </div>
        </div>
      </div>
    </div>
  );
}
