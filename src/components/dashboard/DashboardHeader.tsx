
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface DashboardHeaderProps {
  title?: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
}

export const DashboardHeader = ({ title, description, breadcrumbItems = [] }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col space-y-3 mb-8">
      {title && (
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      )}
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      {breadcrumbItems.length > 0 && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                Home
              </Link>
            </li>
            {breadcrumbItems.map((item, index) => (
              <li key={index}>
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.href}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
};
