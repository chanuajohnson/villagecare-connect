
import { motion } from "framer-motion";
import { Book, UserCog, FileText, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

interface DashboardCardGridProps {
  session: any;
}

export const DashboardCardGrid = ({ session }: DashboardCardGridProps) => {
  return (
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
  );
};

