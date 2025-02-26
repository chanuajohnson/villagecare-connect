
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Building2, UserCog, ClipboardCheck, GraduationCap, Calendar, HeartHandshake, Users } from 'lucide-react';
import { DatabaseFeatureCard } from './DatabaseFeatureCard';
import { AdditionalFeatureCard } from './AdditionalFeatureCard';
import { TechInnovatorsHub } from './TechInnovatorsHub';

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

  const additionalFeatures = [
    {
      title: "Professional Dashboard (After Registration - Caregiver)",
      description: "A dedicated dashboard for professional caregivers with job opportunities, care management tools, certifications, and career growth resources.",
      icon: Briefcase,
    },
    {
      title: "Professional Dashboard (After Registration - Agency)",
      description: "A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.",
      icon: Building2,
    },
    {
      title: "Update Profile (Caregiver)",
      description: "A profile management tool for professional caregivers to update credentials, experience, and skills.",
      icon: UserCog,
    },
    {
      title: "Update Profile (Agency)",
      description: "A dynamic agency profile management tool for services, caregiver availability, and operational details.",
      icon: UserCog,
    },
    {
      title: "Access Professional Tools",
      description: "A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.",
      icon: ClipboardCheck,
    },
    {
      title: "Learn More – Caregiver Learning Hub",
      description: "A dedicated learning space with courses, certifications, and best practices for career advancement.",
      icon: GraduationCap,
    },
    {
      title: "Learn More – Agency Training & Development Hub",
      description: "A training center for agencies offering certifications, compliance training, and workforce development.",
      icon: GraduationCap,
    },
    {
      title: "Community Dashboard (After Registration)",
      description: "A centralized hub for community engagement, support, and caregiving advocacy.",
      icon: Users,
    },
    {
      title: "Find Care Circles",
      description: "A community-driven support system for knowledge sharing and mutual support.",
      icon: HeartHandshake,
    },
    {
      title: "View Events",
      description: "A calendar system for community meetups, workshops, and advocacy events.",
      icon: Calendar,
    },
    {
      title: "Get Involved",
      description: "A volunteer portal for supporting families and caregivers through mentorship and assistance.",
      icon: HeartHandshake,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <DatabaseFeatureCard key={feature.id} feature={feature} />
      ))}
      
      {additionalFeatures.map((feature, index) => (
        <AdditionalFeatureCard
          key={index}
          {...feature}
        />
      ))}

      <TechInnovatorsHub />
    </div>
  );
};

export default FeaturesGrid;
