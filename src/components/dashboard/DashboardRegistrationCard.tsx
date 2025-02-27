
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

export interface DashboardRegistrationCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
  session?: any;
}

export const DashboardRegistrationCard = ({ 
  title = "Complete Your Registration",
  description = "Set up your professional profile to start connecting with families",
  buttonText = "Complete Registration",
  onAction,
  session
}: DashboardRegistrationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {onAction ? (
            <Button className="w-full" onClick={onAction}>
              {buttonText}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Link to={session ? '/register/professional' : '/auth'}>
              <Button className="w-full">
                {session ? 'Complete Registration' : 'Sign in to Register'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
          <UpvoteFeatureButton 
            featureTitle="Professional Registration" 
            className="w-full" 
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
