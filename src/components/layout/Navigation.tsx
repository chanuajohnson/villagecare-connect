
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  UserCircle, 
  LogOut,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, signOut, isLoading } = useAuth();

  return (
    <nav className="bg-background border-b py-3 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Takes a Village</Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/features" className="text-gray-700 hover:text-primary">
            Features
          </Link>
          
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
                    className="flex items-center gap-1 whitespace-nowrap"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xs:inline">Sign Out</span>
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
  );
}
