
import { motion } from "framer-motion";
import { Book, UserCog, FileText, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface FeatureIds {
  [key: string]: string | null;
}

const ProfessionalDashboard = () => {
  const [featureIds, setFeatureIds] = useState<FeatureIds>({
    registration: null,
    profileManagement: null,
    adminTools: null,
    trainingResources: null
  });

  useEffect(() => {
    const fetchFeatureIds = async () => {
      const { data: features, error } = await supabase
        .from('feature_lookup')
        .select('id, title');
      
      if (error) {
        console.error('Error fetching feature IDs:', error);
        return;
      }

      const ids: FeatureIds = {};
      features?.forEach(feature => {
        if (feature.title === 'Professional Registration') ids.registration = feature.id;
        if (feature.title === 'Professional Profile Management') ids.profileManagement = feature.id;
        if (feature.title === 'Administrative Tools') ids.adminTools = feature.id;
        if (feature.title === 'Training Resources Access') ids.trainingResources = feature.id;
      });

      setFeatureIds(ids);
    };

    fetchFeatureIds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <Breadcrumb />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your caregiving services and professional development.</p>
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
              <CardDescription>Set up your professional profile to start connecting with families</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/auth">
                <Button className="w-full">
                  Complete Registration <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <UpvoteFeatureButton 
                featureId={featureIds.registration}
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
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Update Profile <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <UpvoteFeatureButton 
                  featureId={featureIds.profileManagement}
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
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Access Tools <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <UpvoteFeatureButton 
                  featureId={featureIds.adminTools}
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
                <button className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                  Learn More <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <UpvoteFeatureButton 
                  featureId={featureIds.trainingResources}
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
