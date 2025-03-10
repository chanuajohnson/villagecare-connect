import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import { Auth } from '@supabase/ui';
import { supabase } from './lib/supabase';
import { Account } from './pages/auth/Account';
import LandingPage from './pages/LandingPage';
import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AuthPage from './pages/auth/AuthPage';
import RegistrationPage from './pages/auth/RegistrationPage';
import ProfessionalRegistrationForm from './components/auth/ProfessionalRegistrationForm';
import FamilyRegistrationForm from './components/auth/FamilyRegistrationForm';
import CommunityRegistrationForm from './components/auth/CommunityRegistrationForm';
import { useAuth } from './components/providers/AuthProvider';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { Toaster } from 'sonner';
import FeaturesOverview from './pages/FeaturesOverview';
import ProfileViewPage from './pages/professional/ProfileViewPage';

function App() {
  return (
    <Router>
      <Navigation />
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/registration/:role" element={<RegistrationPage />} />
        <Route path="/registration/professional" element={<ProfessionalRegistrationForm />} />
        <Route path="/registration/family" element={<FamilyRegistrationForm />} />
        <Route path="/registration/community" element={<CommunityRegistrationForm />} />
        <Route path="/dashboard/family" element={<FamilyDashboard />} />
        <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
        <Route path="/dashboard/community" element={<CommunityDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/family/features-overview" element={<FeaturesOverview />} />
        <Route path="/professional/profile/:id" element={<ProfileViewPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
