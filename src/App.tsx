
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/providers/AuthProvider';
import AuthPage from './pages/auth/AuthPage';
import FamilyRegistration from "./pages/registration/FamilyRegistration";
import ProfessionalRegistration from "./pages/registration/ProfessionalRegistration";
import CommunityRegistration from "./pages/registration/CommunityRegistration";
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import { Toaster } from 'sonner';

// Temporary placeholder components for missing pages
const HomePage = () => <div className="p-8"><h1 className="text-2xl font-bold">Home Page</h1><p>This is a placeholder for the home page.</p></div>;
const ProfilePage = () => <div className="p-8"><h1 className="text-2xl font-bold">Profile Page</h1><p>This is a placeholder for the profile page.</p></div>;
const Dashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1><p>This is a placeholder for the dashboard page.</p></div>;
const CarePlanPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Care Plan Page</h1><p>This is a placeholder for the care plan page.</p></div>;

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
