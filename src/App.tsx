
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import AuthPage from "@/pages/auth/AuthPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import Index from "@/pages/Index";
import AboutPage from "@/pages/about/AboutPage";
import NotFound from "@/pages/NotFound";
import FeaturesPage from "@/pages/features/FeaturesPage";
import FamilyDashboard from "@/pages/dashboards/FamilyDashboard";
import ProfessionalDashboard from "@/pages/dashboards/ProfessionalDashboard";
import CommunityDashboard from "@/pages/dashboards/CommunityDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { AuthProvider } from "@/components/providers/AuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import FamilyRegistration from "@/pages/registration/FamilyRegistration";
import ProfessionalRegistration from "@/pages/registration/ProfessionalRegistration";
import CommunityRegistration from "@/pages/registration/CommunityRegistration";
import ProfessionalRegistrationFix from "@/pages/registration/ProfessionalRegistrationFix";
import FamilyFeaturesOverview from "@/pages/family/FamilyFeaturesOverview";
import ProfessionalFeaturesOverview from "@/pages/professional/ProfessionalFeaturesOverview";
import CommunityFeaturesOverview from "@/pages/community/CommunityFeaturesOverview";
import TrainingResourcesPage from "@/pages/professional/TrainingResourcesPage";
import ModuleViewerPage from "@/pages/professional/ModuleViewerPage";
import MessageBoardPage from "@/pages/professional/MessageBoardPage";
import FAQPage from "@/pages/support/FAQPage";
import FamilyMatchingPage from "@/pages/family/FamilyMatchingPage";
import CaregiverMatchingPage from "@/pages/caregiver/CaregiverMatchingPage";
import FamilyStoryPage from "@/pages/family/FamilyStoryPage";
import LegacyStoriesPage from "@/pages/legacy/LegacyStoriesPage";
import SubscriptionPage from "@/pages/subscription/SubscriptionPage";
import SubscriptionFeaturesPage from "@/pages/subscription/SubscriptionFeaturesPage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query/devtools';

// Care Management System pages
import CarePlansPage from "@/pages/family/care-management/CarePlansPage";
import CareTeamPage from "@/pages/family/care-management/CareTeamPage";
import CareTasksPage from "@/pages/family/care-management/CareTasksPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <PageViewTracker />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/family-features" element={<FamilyFeaturesOverview />} />
              <Route path="/professional-features" element={<ProfessionalFeaturesOverview />} />
              <Route path="/community-features" element={<CommunityFeaturesOverview />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/legacy-stories" element={<LegacyStoriesPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription/features" element={<SubscriptionFeaturesPage />} />

              {/* Registration routes */}
              <Route path="/register/family" element={<FamilyRegistration />} />
              <Route path="/register/professional" element={<ProfessionalRegistration />} />
              <Route path="/register/professional-fix" element={<ProfessionalRegistrationFix />} />
              <Route path="/register/community" element={<CommunityRegistration />} />

              {/* Dashboard routes */}
              <Route path="/dashboard/family" element={<FamilyDashboard />} />
              <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
              <Route path="/dashboard/community" element={<CommunityDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />

              {/* Family specific routes */}
              <Route path="/dashboard/family/matching" element={<FamilyMatchingPage />} />
              <Route path="/dashboard/family/tell-their-story" element={<FamilyStoryPage />} />
              
              {/* Family Care Management System Routes */}
              <Route path="/dashboard/family/care-plans" element={<CarePlansPage />} />
              <Route path="/dashboard/family/care-plans/:carePlanId/team" element={<CareTeamPage />} />
              <Route path="/dashboard/family/care-plans/:carePlanId/tasks" element={<CareTasksPage />} />

              {/* Professional specific routes */}
              <Route path="/dashboard/professional/training" element={<TrainingResourcesPage />} />
              <Route path="/dashboard/professional/training/:moduleId" element={<ModuleViewerPage />} />
              <Route path="/dashboard/professional/message-board" element={<MessageBoardPage />} />
              <Route path="/dashboard/professional/matching" element={<CaregiverMatchingPage />} />

              {/* Redirects */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/family" replace />} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
