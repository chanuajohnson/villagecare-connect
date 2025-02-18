
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/auth/AuthPage";
import FamilyRegistration from "./pages/registration/FamilyRegistration";
import ProfessionalRegistration from "./pages/registration/ProfessionalRegistration";
import CommunityRegistration from "./pages/registration/CommunityRegistration";
import FamilyDashboard from "./pages/dashboards/FamilyDashboard";
import ProfessionalDashboard from "./pages/dashboards/ProfessionalDashboard";
import CommunityDashboard from "./pages/dashboards/CommunityDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register/family" element={<FamilyRegistration />} />
          <Route path="/register/professional" element={<ProfessionalRegistration />} />
          <Route path="/register/community" element={<CommunityRegistration />} />
          <Route path="/dashboard/family" element={<FamilyDashboard />} />
          <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
          <Route path="/dashboard/community" element={<CommunityDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
