
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  UserCheck, 
  Calendar, 
  Settings, 
  ChevronRight,
  Rocket,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function SubscriptionFeaturesPage() {
  const { user } = useAuth();
  const [hasClickedCTA, setHasClickedCTA] = useState(false);
  
  const premiumFeatures = [
    {
      title: "Message Caregivers Directly",
      description: "No more waiting—send messages instantly to verified caregivers.",
      icon: MessageSquare,
      badge: "Coming Soon",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      title: "Matched Care Services",
      description: "Get connected with the best caregivers tailored to your care situation.",
      icon: UserCheck,
      badge: "Coming Soon",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      title: "Priority Booking for On-Demand Care",
      description: "Request emergency or short-term care with one click.",
      icon: Calendar,
      badge: "Future Feature",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      title: "Enhanced Care Tools",
      description: "Advanced tracking for schedules, medications, and appointments.",
      icon: Settings,
      badge: "Future Feature",
      badgeColor: "bg-purple-100 text-purple-800"
    }
  ];

  const trackCTAClick = async () => {
    try {
      // Track the click in Supabase
      const { error } = await supabase.from('feature_interest_tracking').insert({
        user_id: user?.id || null,
        feature_name: 'premium_subscription',
        source_page: '/subscription-features',
        user_email: user?.email || null,
        action_type: 'cta_click',
        additional_info: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        console.error('Error tracking CTA click:', error);
        toast.error('Something went wrong. Please try again.');
        return;
      }

      // Show success message
      setHasClickedCTA(true);
      toast.success('Thanks for your interest! We\'ll notify you when premium features launch.');
    } catch (err) {
      console.error('Error in trackCTAClick:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 py-1.5 px-4 text-sm">
          Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">🚀 Tavara.Care Premium Features</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Empowering families with smarter, faster care coordination. 
          Get early access to premium features launching soon!
        </p>
        <Button 
          size="lg" 
          className="gap-2 text-lg px-8 py-6"
          onClick={trackCTAClick}
        >
          {hasClickedCTA ? (
            <>
              We've saved your request
              <ChevronRight className="h-5 w-5" />
            </>
          ) : (
            <>
              Unlock Full Access
              <Lock className="h-5 w-5" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {premiumFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className="h-full border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <Badge className={feature.badgeColor}>
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Banner */}
      <motion.div 
        className="bg-gray-100 rounded-xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex justify-center mb-4">
          <Rocket className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Tavara.Care Premium Features are launching soon!</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Join the waitlist to be among the first to access smarter, better caregiving solutions.
        </p>
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2"
          onClick={trackCTAClick}
        >
          {hasClickedCTA ? "We've got your request" : "Join Waitlist"}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
