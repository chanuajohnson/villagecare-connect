
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
  
  // Check if this is a module/lesson path with IDs
  const isModulePath = paths.includes("module");
  
  return paths.map((path, index) => {
    currentPath += `/${path}`;
    
    // Special handling for module and lesson IDs to display them better
    if ((path === "module" || path === "lesson") && index < paths.length - 1) {
      // This is a module or lesson keyword, the next item will be the ID
      return {
        label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        path: currentPath,
      };
    }
    
    // Check if this is an ID following module or lesson
    if (index > 0 && (paths[index - 1] === "module" || paths[index - 1] === "lesson")) {
      // This is an ID, so let's format it nicely
      const prefix = paths[index - 1] === "module" ? "Module" : "Lesson";
      // Return a simplified version (without showing the full ID)
      return {
        label: `${prefix} Content`,
        path: currentPath,
      };
    }
    
    // Normal path handling
    return {
      label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
      path: currentPath,
    };
  }).filter(item => item.label !== "");
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
