
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface DashboardHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  session: any;
  onSignOut: () => void;
  loginUrl: string;
}

export const DashboardHeader = ({ breadcrumbItems, session, onSignOut, loginUrl }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}
              <Link
                to={item.link}
                className={`inline-flex items-center text-sm font-medium ${
                  index === breadcrumbItems.length - 1
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className="flex gap-4">
        {!session ? (
          <Link to={loginUrl}>
            <Button variant="outline">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        ) : (
          <Button variant="outline" onClick={onSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
};

