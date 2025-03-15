
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MessageSquare, Briefcase, Users, Calendar, Clock, Bell, ArrowLeft, Lock } from 'lucide-react';

const SubscriptionFeaturesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Get the feature type from location state or default to "premium"
  const featureType = location.state?.featureType || "Premium Features";
  // Get the return path from location state or default to the dashboard
  const returnPath = location.state?.returnPath || "/dashboard/family";

  const trackFeatureInterest = async () => {
    setLoading(true);
    try {
      const featureName = `${featureType} Access`;
      const sourcePage = returnPath;
      
      // If user is logged in, save with user ID
      if (user) {
        const { error } = await supabase.from('feature_interest_tracking').insert({
          feature_name: featureName,
          user_id: user.id,
          source_page: sourcePage,
          additional_info: { 
            returnPath,
            featureType
          }
        });
        
        if (error) throw error;
      } else {
        // Anonymous tracking
        const { error } = await supabase.from('feature_interest_tracking').insert({
          feature_name: featureName,
          source_page: sourcePage,
          additional_info: { 
            returnPath,
            featureType
          }
        });
        
        if (error) throw error;
      }
      
      toast.success('Thank you for your interest! We\'ll notify you when this feature launches.');
    } catch (error) {
      console.error('Error tracking feature interest:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 py-12">
        <div className="mb-8">
          <Link to={returnPath} className="flex items-center text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {returnPath.includes('professional') ? 'Professional Dashboard' : 'Family Dashboard'}
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">Premium Features Coming Soon</h1>
            <p className="text-gray-600 mt-2">
              You're trying to access <span className="font-medium">{featureType}</span>, which will be available in our upcoming premium plan.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Premium Message Board
              </CardTitle>
              <CardDescription>
                Connect with caregivers and families
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Post care needs, connect with local caregivers, and build your care network.
              </p>
              <div className="flex items-center text-amber-600 text-sm mb-4">
                <Lock className="h-4 w-4 mr-1" />
                <span>Coming Soon</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Opportunities
              </CardTitle>
              <CardDescription>
                Find and apply to caregiving opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Access exclusive caregiving jobs, filter by location, pay rate, and more.
              </p>
              <div className="flex items-center text-amber-600 text-sm mb-4">
                <Lock className="h-4 w-4 mr-1" />
                <span>Coming Soon</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Care Scheduling
              </CardTitle>
              <CardDescription>
                Manage your care calendar efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Schedule appointments, set reminders, and coordinate with your care team.
              </p>
              <div className="flex items-center text-amber-600 text-sm mb-4">
                <Lock className="h-4 w-4 mr-1" />
                <span>Coming Soon</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Care Team Management
              </CardTitle>
              <CardDescription>
                Build and coordinate your care team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Invite family members, caregivers, and healthcare providers to collaborate.
              </p>
              <div className="flex items-center text-amber-600 text-sm mb-4">
                <Lock className="h-4 w-4 mr-1" />
                <span>Coming Soon</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Time Tracking
              </CardTitle>
              <CardDescription>
                Track care hours and shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Log care hours, approve timesheets, and manage caregiver schedules.
              </p>
              <div className="flex items-center text-amber-600 text-sm mb-4">
                <Lock className="h-4 w-4 mr-1" />
                <span>Coming Soon</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Priority Notifications
              </CardTitle>
              <CardDescription>
                Stay informed about care needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Receive real-time alerts for care needs, job opportunities, and team updates.
              </p>
              <div className="flex items-center text-amber-600 text-sm mb-4">
                <Lock className="h-4 w-4 mr-1" />
                <span>Coming Soon</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardHeader>
              <CardTitle className="text-center">Unlock Full Access</CardTitle>
              <CardDescription className="text-center">
                Be the first to know when premium features launch
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                We're working hard to bring these premium features to you. Register your interest to be notified when they're available.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary-600"
                onClick={trackFeatureInterest}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Notify Me When Available'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFeaturesPage;
