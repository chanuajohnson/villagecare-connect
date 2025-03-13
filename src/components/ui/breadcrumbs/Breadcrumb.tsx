
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  path: string;
};

// Enhanced route mapping with more descriptive labels
const routeMap: Record<string, string> = {
  features: "Features",
  auth: "Authentication",
  register: "Registration",
  family: "Family",
  professional: "Professional",
  community: "Community",
  dashboard: "Dashboard",
  "training-resources": "Training Resources",
  module: "Module",
  lesson: "Lesson",
  "message-board": "Message Board",
};

const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  if (pathname === "/") return [];

  const paths = pathname.split("/").filter(Boolean);
  let currentPath = "";
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Process each path segment
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Handle module IDs - convert to friendly names
    if (path === "module" && index < paths.length - 1) {
      // This is a module keyword, the next item will be the ID
      breadcrumbItems.push({
        label: "Module",
        path: currentPath,
      });
      
      // Skip adding the raw module ID as a separate breadcrumb
      return;
    }
    
    // Skip the raw module ID in the breadcrumb
    if (index > 0 && paths[index - 1] === "module") {
      // Instead of showing the ID, add a generic "Content" label
      breadcrumbItems.push({
        label: "Module Content",
        path: currentPath,
      });
      return;
    }
    
    // Handle lesson IDs
    if (path === "lesson" && index < paths.length - 1) {
      breadcrumbItems.push({
        label: "Lesson",
        path: currentPath, 
      });
      return;
    }
    
    // Skip the raw lesson ID in the breadcrumb
    if (index > 0 && paths[index - 1] === "lesson") {
      breadcrumbItems.push({
        label: "Lesson Content",
        path: currentPath,
      });
      return;
    }
    
    // Normal path handling for other routes
    breadcrumbItems.push({
      label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
      path: currentPath,
    });
  });
  
  return breadcrumbItems;
};

export function Breadcrumb() {
  const location = useLocation();
  const items = getBreadcrumbItems(location.pathname);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full py-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <li>
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-primary-600 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
