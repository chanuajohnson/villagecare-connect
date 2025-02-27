
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserCircle, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, signOut, userRole, isLoading } = useAuth();
  
  const getDashboardLink = () => {
    if (!userRole) return '/';
    
    switch (userRole) {
      case 'family':
        return '/dashboard/family';
      case 'professional':
        return '/dashboard/professional';
      case 'community':
        return '/dashboard/community';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-background border-b py-3 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Takes a Village</Link>
        </div>
        
        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <Button onClick={signOut} variant="outline" size="sm" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
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
