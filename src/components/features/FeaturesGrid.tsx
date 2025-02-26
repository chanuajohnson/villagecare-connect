
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Rocket, Users, ShieldCheck, Code, Brain, Briefcase, Building2, UserCog, ClipboardCheck, GraduationCap, Calendar, HeartHandshake } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface AdditionalFeature {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status?: 'planned' | 'in_development' | 'ready_for_demo' | 'launched';
  noList?: boolean;
  benefits?: string[];
}

const FeaturesGrid = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const additionalFeatures: AdditionalFeature[] = [
    {
      title: "Professional Dashboard (After Registration - Caregiver)",
      description: "A dedicated dashboard for professional caregivers with job opportunities, care management tools, certifications, and career growth resources.",
      icon: Briefcase,
      status: 'planned',
      noList: true
    },
    {
      title: "Professional Dashboard (After Registration - Agency)",
      description: "A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.",
      icon: Building2,
      status: 'planned',
      noList: true
    },
    {
      title: "Update Profile (Caregiver)",
      description: "A profile management tool for professional caregivers to update credentials, experience, and skills.",
      icon: UserCog,
      status: 'planned',
      noList: true
    },
    {
      title: "Update Profile (Agency)",
      description: "A dynamic agency profile management tool for services, caregiver availability, and operational details.",
      icon: UserCog,
      status: 'planned',
      noList: true
    },
    {
      title: "Access Professional Tools",
      description: "A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.",
      icon: ClipboardCheck,
      status: 'planned',
      noList: true
    },
    {
      title: "Learn More – Caregiver Learning Hub",
      description: "A dedicated learning space with courses, certifications, and best practices for career advancement.",
      icon: GraduationCap,
      status: 'planned',
      noList: true
    },
    {
      title: "Learn More – Agency Training & Development Hub",
      description: "A training center for agencies offering certifications, compliance training, and workforce development.",
      icon: GraduationCap,
      status: 'planned',
      noList: true
    },
    {
      title: "Community Dashboard (After Registration)",
      description: "A centralized hub for community engagement, support, and caregiving advocacy.",
      icon: Users,
      status: 'planned',
      noList: true
    },
    {
      title: "Find Care Circles",
      description: "A community-driven support system for knowledge sharing and mutual support.",
      icon: HeartHandshake,
      status: 'planned',
      noList: true
    },
    {
      title: "View Events",
      description: "A calendar system for community meetups, workshops, and advocacy events.",
      icon: Calendar,
      status: 'planned',
      noList: true
    },
    {
      title: "Get Involved",
      description: "A volunteer portal for supporting families and caregivers through mentorship and assistance.",
      icon: HeartHandshake,
      status: 'planned',
      noList: true
    }
  ];

  const statusColors = {
    planned: 'bg-gray-100 text-gray-800',
    in_development: 'bg-blue-100 text-blue-800',
    ready_for_demo: 'bg-green-100 text-green-800',
    launched: 'bg-purple-100 text-purple-800'
  };

  const formatStatus = (status: string) => {
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <Card key={feature.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${statusColors[feature.status]}`}>
                  {formatStatus(feature.status)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              {feature.description}
            </CardDescription>
            <div className="mt-4">
              <UpvoteFeatureButton
                featureTitle={feature.title}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      
      {additionalFeatures.map((feature, index) => (
        <Card key={index} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <feature.icon className="h-5 w-5" />
                  {feature.title}
                </CardTitle>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${statusColors[feature.status || 'planned']}`}>
                  {formatStatus(feature.status || 'planned')}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              {feature.description}
            </CardDescription>
            {!feature.noList && feature.benefits && (
              <div className="space-y-2 text-sm">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    {benefit}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <UpvoteFeatureButton
                featureTitle={feature.title}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="lg:col-span-3 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rocket className="h-5 w-5" />
            Insider Access & Tech Innovators Hub
          </CardTitle>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${statusColors['in_development']}`}>
            {formatStatus('in_development')}
          </span>
          <CardDescription>
            A dedicated space for tech enthusiasts, AI builders, and behind-the-scenes explorers who want to follow the platform's development journey, feature rollouts, and upcoming innovations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Exclusive Insider Updates – Get early access to new platform features, UI/UX enhancements, and backend improvements before public release.</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <span>Behind-the-Scenes Tech Drops – Learn about AI integrations, automation tools, and development workflows powering the platform.</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Beta Testing & Feedback Loop – Help refine new features, participate in A/B testing, and provide direct feedback on technical implementations.</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Community of Builders – Connect with other AI enthusiasts, developers, and product innovators who are passionate about using tech to enhance caregiving solutions.</span>
            </div>
          </div>
          <div className="mt-6 space-y-4">
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
  );
};

export default FeaturesGrid;
