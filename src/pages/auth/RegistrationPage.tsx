
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/components/providers/AuthProvider';

const RegistrationPage = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const returnPath = location.state?.returnPath || '/';

  // If user is already logged in, redirect to the appropriate registration page
  if (user && !isLoading) {
    const userRole = user.user_metadata?.role || 'family';
    
    if (userRole === 'family') {
      return <Navigate to="/registration/family" state={{ returnPath }} />;
    } else if (userRole === 'professional') {
      return <Navigate to="/registration/professional" state={{ returnPath }} />;
    } else if (userRole === 'community') {
      return <Navigate to="/registration/community" state={{ returnPath }} />;
    }
    
    // Default fallback if role not recognized
    return <Navigate to="/registration/family" state={{ returnPath }} />;
  }

  // If still loading or no user, show a loading screen or redirect to auth
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not logged in, redirect to auth
  return <Navigate to="/auth" state={{ returnPath }} />;
};

export default RegistrationPage;
