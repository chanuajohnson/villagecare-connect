
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { initializeSupabase } from '@/lib/supabase';
import { useEffect } from 'react';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import NotFoundPage from './pages/NotFound';
import FAQPage from '@/pages/support/FAQPage';
import AuthPage from '@/pages/auth/AuthPage';
import FamilyDashboard from '@/pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from '@/pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from '@/pages/dashboards/CommunityDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Lazy load the subscription features page
const SubscriptionFeaturesPage = lazy(() => import('./pages/subscription/SubscriptionFeaturesPage'));

// Temporary placeholder components until we have the actual pages
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Tavara</h1>
      <p className="mb-6 text-center">A platform for care coordination and support</p>
      <Button onClick={() => navigate('/subscription-features')}>
        Explore Premium Features
      </Button>
    </div>
  );
};

const AboutPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4">About Tavara</h1>
    <p>Connecting families with care professionals since 2023.</p>
  </div>
);

const FeaturesPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4">Tavara Features</h1>
    <p>Discover what Tavara can do for you and your loved ones.</p>
  </div>
);

// Placeholder for RegistrationPage
const RegistrationPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4">Registration</h1>
    <p>Register for a new account.</p>
  </div>
);

function App() {
  useEffect(() => {
    initializeSupabase();
  }, []);

  return (
    <AuthProvider>
      <Toaster richColors closeButton position="top-center" />
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/support" element={<FAQPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Dashboards */}
            <Route path="/dashboard/family" element={<FamilyDashboard />} />
            <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
            <Route path="/dashboard/community" element={<CommunityDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            
            {/* Registration */}
            <Route path="/registration/:role" element={<RegistrationPage />} />
            
            {/* Utility */}
            <Route path="*" element={<NotFoundPage />} />
            
            {/* Subscription */}
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription-features" element={
              <Suspense fallback={<div>Loading...</div>}>
                <SubscriptionFeaturesPage />
              </Suspense>
            } />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
