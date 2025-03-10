
import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import { useAuth } from './components/providers/AuthProvider';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { Toaster } from 'sonner';
import ProfileViewPage from './pages/professional/ProfileViewPage';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import AuthPage from './pages/auth/AuthPage';

function App() {
  return (
    <Router>
      <Navigation />
      <Toaster />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/family" element={<FamilyDashboard />} />
        <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        <Route path="/dashboard/community" element={<CommunityDashboard />} />
        <Route path="/professional/profile/:id" element={<ProfileViewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
