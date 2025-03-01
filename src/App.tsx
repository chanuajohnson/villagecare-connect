import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/providers/AuthProvider';
import AuthPage from './pages/auth/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FamilyRegistration from "./pages/registration/FamilyRegistration";
import ProfessionalRegistration from "./pages/registration/ProfessionalRegistration";
import CommunityRegistration from "./pages/registration/CommunityRegistration";
import Dashboard from './pages/dashboards/Dashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import CarePlanPage from './pages/CarePlanPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster richColors position="bottom-center" />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  // Show a loading indicator while the auth state is being determined
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a more appropriate loading component
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" replace />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" replace />} />
      <Route path="/care-plans/:carePlanId?" element={user ? <CarePlanPage /> : <Navigate to="/auth" replace />} />

      {/* Registration Routes - only accessible if NOT logged in */}
      <Route path="/registration/family" element={<FamilyRegistration />} />
      <Route path="/registration/professional" element={<ProfessionalRegistration />} />
      <Route path="/registration/community" element={<CommunityRegistration />} />

      {/* Dashboard Routes - only accessible if logged in */}
      <Route path="/dashboards" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
      <Route path="/dashboards/family" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
      <Route path="/dashboards/professional" element={user ? <ProfessionalDashboard /> : <Navigate to="/auth" replace />} />
      <Route path="/dashboards/community" element={user ? <CommunityDashboard /> : <Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
