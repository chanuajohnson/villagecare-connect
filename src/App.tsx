
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageViewTracker } from "./components/tracking/PageViewTracker";
import { Toaster } from "@/components/ui/sonner";
import CareManagementPage from "./pages/family/care-management/CareManagementPage";
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
      <PageViewTracker actionType="app_view" additionalData={{ page: "main" }} />
      <Routes>
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/pricing" element={<div>Pricing Page</div>} />
        <Route path="/account" element={<div>Account Page</div>} />
        <Route path="/registration" element={<div>Registration Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />

        {/* Role Based Dashboards */}
        <Route path="/dashboard/family" element={<div>Family Dashboard</div>} />
        <Route path="/dashboard/professional" element={<div>Professional Dashboard</div>} />
        <Route path="/dashboard/community" element={<div>Community Dashboard</div>} />
        
        {/* Care Management Routes */}
        <Route path="/family/care-management" element={<CareManagementPage />} />
        <Route path="/family/care-management/create" element={<CreateCarePlanPage />} />
        <Route path="/family/care-management/team" element={<div>Care Team Page</div>} />
        <Route path="/family/care-management/schedule" element={<div>Care Schedule Page</div>} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
