
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { DashboardRegistrationCard } from "@/components/dashboard/DashboardRegistrationCard";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";
import { Button } from "@/components/ui/button";
import { Clipboard, Book, PenLine } from "lucide-react";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { CareManagementCard } from "@/components/family/CareManagementCard";
import { getUserRole } from "@/lib/supabase";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(true);
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
    // This would normally check registration status from the database
    // For now we'll just simulate it
    setIsRegistrationComplete(true);
    
    // Set some completed steps for demonstration
    setCompletedSteps(["profile", "preferences"]);
    
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
          <p className="text-gray-600 mt-2">Manage your care resources and support network.</p>
        </motion.div>

        {/* Display registration card if needed */}
        {!isRegistrationComplete && (
          <div className="mb-8">
            <DashboardRegistrationCard
              userType="family"
              completedSteps={completedSteps}
              totalSteps={3}
              registrationPath="/register/family"
            />
          </div>
        )}

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CareManagementCard />
          </div>
          <div>
            <FamilyNextStepsPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CaregiverMatchingCard />
          </div>
          <div>
            <TellTheirStoryCard />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Resources & Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-gray-200"
              onClick={() => navigate("/family-features")}
            >
              <Clipboard className="h-6 w-6 text-blue-600" />
              <span className="text-base font-medium">Family Resources</span>
              <span className="text-sm text-gray-500">Guides and tools for caregiving</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-gray-200"
              onClick={() => navigate("/legacy-stories")}
            >
              <Book className="h-6 w-6 text-teal-600" />
              <span className="text-base font-medium">Legacy Stories</span>
              <span className="text-sm text-gray-500">Preserve your loved one's history</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-gray-200"
              onClick={() => navigate("/dashboard/family/tell-their-story")}
            >
              <PenLine className="h-6 w-6 text-purple-600" />
              <span className="text-base font-medium">Tell Their Story</span>
              <span className="text-sm text-gray-500">Create a life narrative</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
