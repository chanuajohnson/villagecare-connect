import { motion } from "framer-motion";
import { Users, Heart, Calendar, ArrowRight, LogIn, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const CommunityDashboard = () => {
  const [session, setSession] = useState<any>(null);

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
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
      } else {
        setSession(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An unexpected error occurred while signing out');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
          <p className="text-gray-600 mt-2">Connect and contribute to your local care community.</p>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>Set up your community profile to start supporting families</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/auth">
                <Button className="w-full">
                  Complete Registration <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <UpvoteFeatureButton featureTitle="Community Registration" className="w-full" />
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
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Join Care Circles</CardTitle>
                <CardDescription>Connect with families and other community members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Find Circles <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <UpvoteFeatureButton featureTitle="Care Circles" className="w-full" />
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
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Community Events</CardTitle>
                <CardDescription>Discover and participate in local care events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  View Events <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <UpvoteFeatureButton featureTitle="Community Events" className="w-full" />
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
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle>Support Network</CardTitle>
                <CardDescription>Offer and receive community support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Get Involved <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <UpvoteFeatureButton featureTitle="Support Network" className="w-full" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
