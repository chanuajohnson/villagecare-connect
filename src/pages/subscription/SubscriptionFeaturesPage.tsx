
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

export default function SubscriptionFeaturesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnPath, referringPagePath, referringPageLabel, featureType } = location.state || {};

  // Create breadcrumb items
  const breadcrumbItems = [];
  
  // Add referring page if available
  if (referringPagePath && referringPageLabel) {
    breadcrumbItems.push({
      label: referringPageLabel,
      path: referringPagePath,
    });
  }
  
  // Remove the conditional that was adding returnPath when different from referringPagePath
  // This was causing the extra "Family Matching" breadcrumb to appear
  
  // Add current page
  breadcrumbItems.push({
    label: "Subscription",
    path: "/subscription-features",
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
            
            {breadcrumbItems.map((item, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbSeparator />
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.path}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
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
              if (returnPath) {
                navigate(returnPath, { state: { from: 'subscription' } });
              } else {
                navigate('/');
              }
            }}
          >
            {returnPath ? 'Go Back' : 'Go Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
