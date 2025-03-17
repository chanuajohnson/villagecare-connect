
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "@/components/providers/AuthProvider";

export default function SubscriptionFeaturesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { returnPath, referringPagePath, referringPageLabel, featureType } = location.state || {};

  // Default dashboard path based on user role if not provided
  const defaultDashboardPath = user?.role === 'family' 
    ? '/dashboard/family' 
    : user?.role === 'professional' 
      ? '/dashboard/professional'
      : '/';
  
  const defaultDashboardLabel = user?.role === 'family' 
    ? 'Family Dashboard' 
    : user?.role === 'professional' 
      ? 'Professional Dashboard'
      : 'Home';

  // Use provided paths or fallback to defaults
  const dashboardPath = referringPagePath || returnPath || defaultDashboardPath;
  const dashboardLabel = referringPageLabel || defaultDashboardLabel;

  console.log("Subscription page navigation state:", { 
    returnPath, 
    referringPagePath, 
    referringPageLabel, 
    dashboardPath, 
    dashboardLabel
  });

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {/* Always show the dashboard breadcrumb item, but ensure it's not "Home" again */}
            {dashboardPath && dashboardPath !== "/" && (
              <BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <Link to={dashboardPath}>{dashboardLabel !== "Home" ? dashboardLabel : "Dashboard"}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Subscription</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">
        {featureType ? `Unlock ${featureType}` : 'Subscription Features'}
      </h1>
      
      {/* Subscription content */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <p className="text-lg">This is the subscription features page content.</p>
        
        {featureType && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-blue-800">
              You're viewing information about <strong>{featureType}</strong>.
            </p>
          </div>
        )}
        
        <div className="mt-6">
          <button 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            onClick={() => {
              if (dashboardPath) {
                navigate(dashboardPath, { state: { from: 'subscription' } });
              } else {
                navigate('/');
              }
            }}
          >
            {dashboardPath ? 'Go Back' : 'Go Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
