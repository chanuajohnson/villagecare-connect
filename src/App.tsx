
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { supabase, getUserRole } from "@/lib/supabase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/auth/AuthPage";
import FeaturesPage from "./pages/features/FeaturesPage";
import FamilyRegistration from "./pages/registration/FamilyRegistration";
import ProfessionalRegistration from "./pages/registration/ProfessionalRegistration";
import CommunityRegistration from "./pages/registration/CommunityRegistration";
import FamilyDashboard from "./pages/dashboards/FamilyDashboard";
import ProfessionalDashboard from "./pages/dashboards/ProfessionalDashboard";
import CommunityDashboard from "./pages/dashboards/CommunityDashboard";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = async (session: any) => {
      if (session && location.pathname === '/auth') {
        const userRole = await getUserRole();
        
        // Redirect based on user role
        switch(userRole) {
          case 'family':
            navigate('/dashboard/family', { replace: true });
            break;
          case 'professional':
            navigate('/dashboard/professional', { replace: true });
            break;
          case 'community':
            navigate('/dashboard/community', { replace: true });
            break;
          default:
            // If no role is set yet, default to family (you can modify this default)
            console.log('No role found for user, defaulting to family dashboard');
            navigate('/dashboard/family', { replace: true });
        }
      }
    };

    // Handle the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // Set up auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/register/family" element={<FamilyRegistration />} />
      <Route path="/register/professional" element={<ProfessionalRegistration />} />
      <Route path="/register/community" element={<CommunityRegistration />} />
      <Route path="/dashboard/family" element={<FamilyDashboard />} />
      <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
      <Route path="/dashboard/community" element={<CommunityDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
