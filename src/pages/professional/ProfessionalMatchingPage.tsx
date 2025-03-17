
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Home } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export default function ProfessionalMatchingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // This is a stub component - would need to be fully implemented based on requirements
  
  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      navigate("/auth", { 
        state: { returnPath: "/professional-matching", action: "findProfessionals" }
      });
    }
  }, [user, navigate]);
  
  return (
    <div className="container px-4 py-8">
      {/* Add breadcrumb navigation */}
      <div className="mb-6">
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
            
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink asChild>
                <Link to="/dashboard/family">
                  Family Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Professional Matching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Professional Matching</h1>
        <p className="text-gray-600">
          Find caregivers that match your family's needs
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Professional Matching</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This feature is under development. Check back soon!</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/dashboard/family")}
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
