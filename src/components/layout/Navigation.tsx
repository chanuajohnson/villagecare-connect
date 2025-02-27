
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Home
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from 'react-router-dom';

export function Navigation() {
  const { user, signOut, isLoading } = useAuth();
  const location = useLocation();
  
  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    if (location.pathname === "/") return [];
    
    const paths = location.pathname.split("/").filter(Boolean);
    const items = [];
    let currentPath = "";
    
    const routeMap = {
      features: "Features",
      auth: "Authentication",
      register: "Registration",
      family: "Family",
      professional: "Professional",
      community: "Community",
      dashboard: "Dashboard",
      registration: "Registration",
      admin: "Admin",
    };
    
    for (const path of paths) {
      currentPath += `/${path}`;
      items.push({
        label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        path: currentPath,
      });
    }
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  return (
    <>
      <nav className="bg-background border-b py-3 px-4 sm:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">Takes a Village</Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/features" className="text-gray-700 hover:text-primary">
              Features
            </Link>
            
            {/* Always show Dashboards dropdown regardless of authentication status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboards</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/family" className="w-full cursor-pointer">
                    Family Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/professional" className="w-full cursor-pointer">
                    Professional Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/community" className="w-full cursor-pointer">
                    Community Dashboard
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs text-gray-600 max-w-[120px] truncate">
                      {user.email}
                    </span>
                    <Button 
                      onClick={signOut} 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="inline sm:inline">Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button size="sm">Sign In</Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Breadcrumbs section */}
      {breadcrumbItems.length > 0 && (
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="container mx-auto">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-500 hover:text-primary flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Home
                  </Link>
                </li>
                
                {breadcrumbItems.map((item, index) => (
                  <li key={item.path} className="flex items-center">
                    <span className="text-gray-400 mx-1">/</span>
                    {index === breadcrumbItems.length - 1 ? (
                      <span className="text-gray-800 font-medium" aria-current="page">
                        {item.label}
                      </span>
                    ) : (
                      <Link to={item.path} className="text-gray-500 hover:text-primary">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
