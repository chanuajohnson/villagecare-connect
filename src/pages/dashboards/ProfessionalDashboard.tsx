
import { motion } from "framer-motion";
import { Book, UserCog, FileText, ArrowRight, LogIn, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ProfessionalDashboard = () => {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Professional Dashboard mounting");
    
    // Initialize session state
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Got session:", session);
        setSession(session);
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      if (_event === 'SIGNED_OUT') {
        console.log('User signed out, clearing session');
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
  };

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Professional Dashboard", link: "/dashboard/professional" }
  ];

  // Construct the login URL with returnTo parameter
  const loginUrl = `/auth?returnTo=${encodeURIComponent('/dashboard/professional')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
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
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your caregiving services and professional development.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>Set up your professional profile to start connecting with families</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to={session ? '/register/professional' : '/auth'}>
                <Button className="w-full">
                  {session ? 'Complete Registration' : 'Sign in to Register'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <UpvoteFeatureButton 
                featureTitle="Professional Registration" 
                className="w-full" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <UserCog className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Showcase your qualifications and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to={session ? '/profile/professional' : '/auth'}>
                  <Button className="w-full">
                    {session ? 'Update Profile' : 'Sign in to Access Profile'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton 
                  featureTitle="Professional Profile Management" 
                  className="w-full" 
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Admin Assistant</CardTitle>
                <CardDescription>Streamline your administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 mb-4 text-sm text-gray-600">
                  <li>Get Job Letters</li>
                  <li>NIS Registration Assistance</li>
                  <li>Document Management</li>
                  <li>Administrative Support</li>
                </ul>
                <Link to={session ? '/admin/tools' : '/auth'}>
                  <Button className="w-full">
                    {session ? 'Access Tools' : 'Sign in to Access Tools'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton 
                  featureTitle="Administrative Tools" 
                  className="w-full" 
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Book className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Training Resources</CardTitle>
                <CardDescription>Access our comprehensive library of caregiving resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to={session ? '/training/resources' : '/auth'}>
                  <Button className="w-full">
                    {session ? 'Learn More' : 'Sign in to Access Training'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton 
                  featureTitle="Training Resources Access" 
                  className="w-full" 
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
