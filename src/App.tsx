import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/ui";
import AccountPage from "./pages/AccountPage";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import HelpPage from "./pages/support/HelpPage";
import FAQPage from "./pages/support/FAQPage";
import ContactPage from "./pages/support/ContactPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import CommunityPage from "./pages/CommunityPage";
import CaregiverMatchingPage from "./pages/CaregiverMatchingPage";
import TaskManagementPage from "./pages/TaskManagementPage";
import ProfessionalNetworkPage from "./pages/ProfessionalNetworkPage";
import RegistrationPage from "./pages/RegistrationPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import JourneyTrackingExample from "./components/tracking/JourneyTrackingExample";
import JourneyAnalyticsPage from "./pages/admin/JourneyAnalyticsPage";

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null); // Update user state
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const getRole = async () => {
      if (!user?.id) {
        setUserRole(null);
        return;
      }

      // First, try to get the role from user metadata (fastest)
      if (user?.app_metadata?.role) {
        setUserRole(user.app_metadata.role);
        return;
      }

      // Second, query the profiles table
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else if (data?.role) {
          setUserRole(data.role);
          return;
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
      }

      // Finally, use localStorage fallback for registration intent
      const localStorageRole = localStorage.getItem("registration_role");
      if (localStorageRole) {
        setUserRole(localStorageRole);
        return;
      }

      setUserRole(null);
    };

    getRole();
  }, [user?.id, user?.app_metadata?.role, supabase]);

  const isAdmin = userRole === "admin";
  const isCaregiver = userRole === "caregiver";
  const isFamily = userRole === "family";

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage session={session} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver-matching"
          element={
            <ProtectedRoute>
              <CaregiverMatchingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-management"
          element={
            <ProtectedRoute>
              <TaskManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional-network"
          element={
            <ProtectedRoute>
              <ProfessionalNetworkPage />
            </ProtectedRoute>
          }
        />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route
          path="/admin/user-management"
          element={
            <AdminRoute>
              <AdminUserManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/tracking-example"
          element={
            <ProtectedRoute>
              <JourneyTrackingExample />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/journey-analytics" element={<JourneyAnalyticsPage />} />
      </Routes>
    </Router>
  );

  function ProtectedRoute({ children }) {
    if (!session) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  function AdminRoute({ children }) {
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }
}

export default App;
