
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/providers/AuthProvider';
import { Toaster } from 'sonner'; // Use Toaster from sonner
import { supabase } from './lib/supabase';

// Import the Registration Page from the auth directory
import RegistrationPage from './pages/auth/RegistrationPage';

// Import pages
import { LandingPage } from './pages/LandingPage';
import SubscriptionFeaturesPage from './pages/subscription/SubscriptionFeaturesPage';
import PricingPage from './pages/pricing/PricingPage';

// Import matching pages
import FamilyMatchingPage from "./pages/family/FamilyMatchingPage";
import ProfessionalMatchingPage from "./pages/professional/ProfessionalMatchingPage";

function App() {
  useEffect(() => {
    const handleAuthStateChange = async (event: any, session: any) => {
      if (event === 'SIGNED_IN') {
        // User signed in
        console.log('User signed in:', session);
        // You can perform actions here when a user signs in, like updating local storage
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        console.log('User signed out');
        // Perform actions here when a user signs out, like clearing local storage
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscription-features" element={<SubscriptionFeaturesPage />} />
          
          {/* Family Matching Page */}
          <Route path="/family-matching" element={<FamilyMatchingPage />} />
        
          {/* Professional Matching Page */}
          <Route path="/professional-matching" element={<ProfessionalMatchingPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
