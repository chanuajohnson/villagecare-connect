
import { motion } from "framer-motion";
import { Book, UserCog, FileText, ArrowRight, LogIn, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ProfessionalDashboard = () => {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
        return;
      }
      
      // Clear session state
      setSession(null);
      navigate('/');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Breadcrumb />
          <div className="flex gap-4">
            {!session ? (
              <Link to="/auth">
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
              <Button className="w-full" onClick={() => handleNavigation('/register/professional')}>
                Complete Registration <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
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
                <Button 
                  className="w-full" 
                  onClick={() => handleNavigation('/profile/professional')}
                >
                  Update Profile <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
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
                <Button 
                  className="w-full" 
                  onClick={() => handleNavigation('/admin/tools')}
                >
                  Access Tools <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
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
                <Button 
                  className="w-full" 
                  onClick={() => handleNavigation('/training/resources')}
                >
                  Learn More <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
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

