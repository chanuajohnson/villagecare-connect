
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { JourneyTrackingExample } from "./components/tracking/JourneyTrackingExample";
import JourneyAnalyticsPage from "./pages/admin/JourneyAnalyticsPage";
import { supabase } from "./lib/supabase"; // Use the existing Supabase client

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Fetch session directly from the Supabase client
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
  }, []);

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
  }, [user?.id, user?.app_metadata?.role]);

  const isAdmin = userRole === "admin";
  const isCaregiver = userRole === "caregiver";
  const isFamily = userRole === "family";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/pricing" element={<div>Pricing Page</div>} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <div>Account Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <div>Help Page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/faq" element={<div>FAQ Page</div>} />
        <Route path="/contact" element={<div>Contact Page</div>} />
        <Route path="/terms" element={<div>Terms of Service Page</div>} />
        <Route path="/privacy" element={<div>Privacy Policy Page</div>} />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <div>Community Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver-matching"
          element={
            <ProtectedRoute>
              <div>Caregiver Matching Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-management"
          element={
            <ProtectedRoute>
              <div>Task Management Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional-network"
          element={
            <ProtectedRoute>
              <div>Professional Network Page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/registration" element={<div>Registration Page</div>} />
        <Route
          path="/admin/user-management"
          element={
            <AdminRoute>
              <div>Admin User Management Page</div>
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
        <Route 
          path="/admin/journey-analytics" 
          element={<JourneyAnalyticsPage />} 
        />
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
