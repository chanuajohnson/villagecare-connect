
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface DashboardHeaderProps {
  /**
   * The title to display at the top of the dashboard
   */
  title: string;
  
  /**
   * A brief description of the dashboard's purpose
   */
  description?: string;
  
  /**
   * Optional breadcrumb items for navigation
   */
  breadcrumbItems?: BreadcrumbItem[];
}

export const DashboardHeader = ({ 
  title, 
  description, 
  breadcrumbItems = [] 
}: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      {breadcrumbItems.length > 0 && (
        <div className="flex justify-between items-center mb-4">
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
      )}
      
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};
