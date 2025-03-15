
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import FeaturesPage from '@/pages/FeaturesPage';
import FAQPage from '@/pages/support/FAQPage';
import AuthPage from '@/pages/auth/AuthPage';
import FamilyDashboard from '@/pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from '@/pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from '@/pages/dashboards/CommunityDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import RegistrationPage from '@/pages/auth/RegistrationPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { initializeSupabase } from '@/lib/supabase';
import { useEffect } from 'react';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';

// Lazy load the subscription features page
const SubscriptionFeaturesPage = lazy(() => import('./pages/subscription/SubscriptionFeaturesPage'));

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
