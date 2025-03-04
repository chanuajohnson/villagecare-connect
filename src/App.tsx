
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navigation } from "@/components/layout/Navigation";
import { useEffect } from "react";
import { initializeSupabase } from "@/lib/supabase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/features/FeaturesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FamilyDashboard from "./pages/dashboards/FamilyDashboard";
import CommunityDashboard from "./pages/dashboards/CommunityDashboard";
import ProfessionalDashboard from "./pages/dashboards/ProfessionalDashboard";
import AuthPage from "./pages/auth/AuthPage";
import FamilyRegistration from "./pages/registration/FamilyRegistration";
import ProfessionalRegistration from "./pages/registration/ProfessionalRegistration";
import CommunityRegistration from "./pages/registration/CommunityRegistration";
import CommunityFeaturesOverview from "./pages/community/CommunityFeaturesOverview";
import ProfessionalFeaturesOverview from "./pages/professional/ProfessionalFeaturesOverview";
import FamilyFeaturesOverview from "./pages/family/FamilyFeaturesOverview";
import FAQPage from "./pages/support/FAQPage";
import { Fab } from "@/components/ui/fab";

const queryClient = new QueryClient();

const AppWithProviders = () => {
  // Initialize Supabase early
  useEffect(() => {
    initializeSupabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/family" element={<FamilyDashboard />} />
          <Route path="/dashboard/community" element={<CommunityDashboard />} />
          <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
          
          {/* Registration routes with role-specific forced routing */}
          <Route path="/registration/family" element={<FamilyRegistration />} />
          <Route path="/registration/professional" element={<ProfessionalRegistration />} />
          <Route path="/registration/community" element={<CommunityRegistration />} />
          
          <Route path="/community/features-overview" element={<CommunityFeaturesOverview />} />
          <Route path="/professional/features-overview" element={<ProfessionalFeaturesOverview />} />
          <Route path="/family/features-overview" element={<FamilyFeaturesOverview />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Global FAB that appears on all pages except the homepage and FAQ page where we have specific implementations */}
      <GlobalFAB />
    </div>
  );
};

// Component to handle showing the FAB on all pages except certain ones
const GlobalFAB = () => {
  const pathname = window.location.pathname;
  
  // Don't show the global FAB on the homepage or FAQ page since they have their own implementations
  if (pathname === "/" || pathname === "/faq") {
    return null;
  }
  
  return (
    <Fab 
      className="bg-primary-500 hover:bg-primary-600 text-white"
      label="Support options"
    />
  );
};

export default AppWithProviders;
