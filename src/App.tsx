import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "sonner"

import { AuthProvider } from './components/providers/AuthProvider';
import { supabase } from './lib/supabase';

import Index from './pages/Index';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';

import FamilyRegistration from './pages/registration/FamilyRegistration';
import ProfessionalRegistration from './pages/registration/ProfessionalRegistration';
import CommunityRegistration from './pages/registration/CommunityRegistration';

import FamilyDashboard from './pages/dashboards/FamilyDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import CommunityDashboard from './pages/dashboards/CommunityDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

import FamilyFeaturesOverview from './pages/family/FamilyFeaturesOverview';
import ProfessionalFeaturesOverview from './pages/professional/ProfessionalFeaturesOverview';
import CommunityFeaturesOverview from './pages/community/CommunityFeaturesOverview';

import TrainingResourcesPage from './pages/professional/TrainingResourcesPage';
import ModuleViewerPage from './pages/professional/ModuleViewerPage';
import MessageBoardPage from './pages/professional/MessageBoardPage';

import CaregiverMatchingPage from './pages/caregiver/CaregiverMatchingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionFeaturesPage from './pages/SubscriptionFeaturesPage';

import FAQPage from './pages/FAQPage';
import FamilyMatchingPage from './pages/caregiver/FamilyMatchingPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = new QueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider supabase={supabase}>
        <ThemeProvider defaultTheme="light" storageKey="tavara-ui-theme">
          <Router>
            <Navigation />
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                
                {/* Registration */}
                <Route path="/registration/family" element={<FamilyRegistration />} />
                <Route path="/registration/professional" element={<ProfessionalRegistration />} />
                <Route path="/registration/community" element={<CommunityRegistration />} />
                
                {/* Dashboards */}
                <Route path="/dashboard/family" element={<FamilyDashboard />} />
                <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
                <Route path="/dashboard/community" element={<CommunityDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                
                {/* Features Pages */}
                <Route path="/family/features-overview" element={<FamilyFeaturesOverview />} />
                <Route path="/professional/features-overview" element={<ProfessionalFeaturesOverview />} />
                <Route path="/community/features-overview" element={<CommunityFeaturesOverview />} />
                
                {/* Professional Pages */}
                <Route path="/professional/training-resources" element={<TrainingResourcesPage />} />
                <Route path="/professional/module/:moduleId" element={<ModuleViewerPage />} />
                <Route path="/professional/message-board" element={<MessageBoardPage />} />
                
                {/* Caregiver Matching */}
                <Route path="/caregiver-matching" element={<CaregiverMatchingPage />} />

                {/* New Family Matching */}
                <Route path="/family-matching" element={<FamilyMatchingPage />} />
                
                {/* Subscription */}
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/subscription-features" element={<SubscriptionFeaturesPage />} />
                
                {/* FAQ */}
                <Route path="/faq" element={<FAQPage />} />
                
                {/* Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
            <Toaster />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
