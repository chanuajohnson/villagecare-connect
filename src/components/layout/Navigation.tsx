
import { Link, useLocation } from 'react-router-dom';
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
import { toast } from 'sonner';
import { resetAuthState } from '@/lib/supabase';

export function Navigation() {
  const { user, signOut, isLoading, userRole } = useAuth();
  const location = useLocation();

  // Enhanced logging for debugging purposes
  console.log('Navigation render -', { 
    user: !!user, 
    isLoading, 
    userRole, 
    path: location.pathname,
    userDetails: user ? {
      id: user.id,
      email: user.email,
      hasMetadataRole: !!user.user_metadata?.role
    } : null
  });

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      toast.loading("Signing out...");
      
      // Attempt sign out with timeout to prevent hanging
      const signOutPromise = signOut();
      
      // Set a timeout to ensure the operation doesn't hang
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timed out')), 5000);
      });
      
      // Race between normal sign out and timeout
      await Promise.race([signOutPromise, timeoutPromise]);
      
      // The signOut function now handles success messaging
    } catch (error) {
      console.error('Error in Navigation signOut handler:', error);
      
      // If the error is a timeout or other critical error, use the reset function
      if (error instanceof Error && (
        error.message.includes('timed out') || 
        error.message.includes('JWT') ||
        error.message.includes('network')
      )) {
        console.log('Attempting to force reset auth state...');
        await resetAuthState();
      }
      
      // Force a successful logout even if there's an error with Supabase
      toast.dismiss();
      toast.success('You have been signed out successfully');
    }
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!userRole) return null;
    
    switch (userRole) {
      case 'family':
        return '/dashboard/family';
      case 'professional':
        return '/dashboard/professional';
      case 'community':
        return '/dashboard/community';
      case 'admin':
        return '/dashboard/admin';
      default:
        return null;
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <nav className="bg-background border-b py-3 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center flex-col sm:flex-row">
          <Link to="/" className="text-xl font-bold">Tavara</Link>
          <span className="text-xs text-gray-600 italic sm:ml-2">It takes a village to care</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-gray-700 hover:text-primary">
            About
          </Link>
          
          <Link to="/features" className="text-gray-700 hover:text-primary">
            Features
          </Link>
          
          {user && dashboardPath ? (
            // Show only user's specific dashboard when logged in
            <Link to={dashboardPath} className="flex items-center gap-1 text-gray-700 hover:text-primary">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">
                {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard` : 'Dashboard'}
              </span>
            </Link>
          ) : !user ? (
            // Show all dashboards dropdown when not logged in
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
          ) : null}

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
