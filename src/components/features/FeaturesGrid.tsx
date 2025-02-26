import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FeatureCard from './FeatureCard';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, ShieldCheck, Code, Brain } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UpvoteFeatureButton } from '@/components/features/UpvoteFeatureButton';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  _count?: {
    votes: number;
  };
}

const FeaturesGrid = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFeatures = async () => {
    try {
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*, feature_votes(count)');

      if (featuresError) throw featuresError;

      const formattedFeatures = featuresData.map(feature => ({
        ...feature,
        _count: {
          votes: feature.feature_votes[0]?.count || 0
        }
      }));

      setFeatures(formattedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchFeatures();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading features...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            isAuthenticated={!!session}
            userEmail={session?.user?.email}
            userType="family"
            onVote={fetchFeatures}
          />
        ))}
      </div>
      
      <div className="col-span-full">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-primary-600" />
              <CardTitle className="text-2xl">Insider Access & Tech Innovators Hub</CardTitle>
            </div>
            <CardDescription className="text-lg">
              A dedicated space for tech enthusiasts, AI builders, and behind-the-scenes explorers who want to follow the platform's development journey, feature rollouts, and upcoming innovations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-600 mt-1" />
                <p>Exclusive Insider Updates – Get early access to new platform features, UI/UX enhancements, and backend improvements before public release.</p>
              </div>
              <div className="flex items-start gap-2">
                <Code className="w-5 h-5 text-primary-600 mt-1" />
                <p>Behind-the-Scenes Tech Drops – Learn about AI integrations, automation tools, and development workflows powering the platform.</p>
              </div>
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-primary-600 mt-1" />
                <p>Beta Testing & Feedback Loop – Help refine new features, participate in A/B testing, and provide direct feedback on technical implementations.</p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-primary-600 mt-1" />
                <p>Community of Builders – Connect with other AI enthusiasts, developers, and product innovators who are passionate about using tech to enhance caregiving solutions.</p>
              </div>
            </div>
            <div className="pt-4 space-y-4">
              <Link to="/auth" className="block w-full">
                <Button className="w-full">
                  Join the Innovators Hub 🚀
                </Button>
              </Link>
              <UpvoteFeatureButton
                featureTitle="Insider Access & Tech Innovators Hub"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FeaturesGrid;
