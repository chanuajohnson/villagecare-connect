import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  path: string;
};

const routeMap: Record<string, string> = {
  features: "Features",
  auth: "Authentication",
  register: "Registration",
  family: "Family",
  professional: "Professional",
  community: "Community",
  dashboard: "Dashboard",
};

const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  if (pathname === "/") return [];

  const paths = pathname.split("/").filter(Boolean);
  let currentPath = "";

  return paths.map((path) => {
    currentPath += `/${path}`;
    if (path === "dashboard" && paths.length === 1) {
      return {
        label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        path: "/",
      };
    }
    return {
      label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
      path: currentPath,
    };
  });
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
          <Fragment key={item.path}>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </li>
            <li>
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
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
