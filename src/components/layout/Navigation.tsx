
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LogOut,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, signOut, isLoading } = useAuth();

  // Log state for debugging purposes
  console.log('Navigation render -', { user: !!user, isLoading });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error in Navigation signOut handler:', error);
    }
  };

  return (
    <nav className="bg-background border-b py-3 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Takes a Village</Link>
        </div>
        
        <div className="flex items-center gap-4">
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

          {isLoading ? (
            <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </Button>
          ) : user ? (
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
