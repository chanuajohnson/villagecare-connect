
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbSimpleProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSimple({ items }: BreadcrumbSimpleProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center py-4 text-gray-600">
      <Link
        to="/"
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
        aria-label="Home"
      >
        <Home className="h-5 w-5" />
        <span className="ml-2 text-base">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <ChevronRight className="h-5 w-5 mx-2 text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-base font-semibold text-gray-900" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="text-base text-gray-600 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
