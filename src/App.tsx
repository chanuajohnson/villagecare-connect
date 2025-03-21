import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Auth } from "@supabase/ui";
import { supabase } from "@/lib/supabase";
import AccountPage from "@/pages/AccountPage";
import LandingPage from "@/pages/LandingPage";
import PricingPage from "@/pages/PricingPage";
import DashboardPage from "@/pages/DashboardPage";
import FamilyDashboard from "@/pages/family/FamilyDashboard";
import ProfessionalDashboard from "@/pages/professional/ProfessionalDashboard";
import CommunityDashboard from "@/pages/community/CommunityDashboard";
import RegistrationPage from "@/pages/RegistrationPage";
import CareManagementPage from "@/pages/family/care-management/CareManagementPage";
import CareTeamPage from "@/pages/family/care-management/CareTeamPage";
import CareSchedulePage from "@/pages/family/care-management/CareSchedulePage";
import { PageViewTracker } from "./components/tracking/PageViewTracker";
import { Toaster } from "@/components/ui/sonner";

// Import the CreateCarePlanPage 
import CreateCarePlanPage from "./pages/family/care-management/CreateCarePlanPage";

function App() {
  const { session, user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== "/") {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  return (
    <>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Role Based Dashboards */}
        <Route path="/dashboard/family" element={<FamilyDashboard />} />
        <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        <Route path="/dashboard/community" element={<CommunityDashboard />} />
        
        {/* Care Management Routes */}
        <Route path="/family/care-management" element={<CareManagementPage />} />
        <Route path="/family/care-management/create" element={<CreateCarePlanPage />} />
        <Route path="/family/care-management/team" element={<CareTeamPage />} />
        <Route path="/family/care-management/schedule" element={<CareSchedulePage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
