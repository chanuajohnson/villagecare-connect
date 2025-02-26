import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FeatureCard from './FeatureCard';
import { useNavigate, Link } from 'react-router-dom';
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

  const additionalFeatures = [
    {
      title: "Professional Dashboard (After Registration - Caregiver)",
      description: "A dedicated dashboard for professional caregivers with job opportunities, care management tools, certifications, and career growth resources.",
      icon: Briefcase,
      benefits: [
        "Seamless Job Matching – Connect with families and agencies based on qualifications and experience",
        "Task & Client Management – Track assignments, schedules, and care logs efficiently",
        "Credential Storage – Upload certifications, background checks, and essential documents",
        "Career Growth Tools – Access ongoing training, professional development, and networking opportunities"
      ]
    },
    {
      title: "Professional Dashboard (After Registration - Agency)",
      description: "A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.",
      icon: Building2,
      benefits: [
        "Caregiver & Client Management – Assign professionals, manage shifts, and maintain care standards",
        "Compliance & Documentation – Track certifications, background checks, and agency policies",
        "Business Optimization – Streamline invoicing, payroll, and staff performance monitoring",
        "Growth & Expansion – Access tools to attract more clients and scale operations"
      ]
    },
    {
      title: "Update Profile (Caregiver)",
      description: "A profile management tool for professional caregivers to update credentials, experience, and skills.",
      icon: UserCog,
      benefits: [
        "Showcase Specializations – Highlight specific expertise in areas like dementia or pediatric care",
        "Keep Availability Updated – Ensure current work schedule visibility",
        "Increase Job Matches – Boost visibility for relevant care opportunities"
      ]
    },
    {
      title: "Update Profile (Agency)",
      description: "A dynamic agency profile management tool for services, caregiver availability, and operational details.",
      icon: UserCog,
      benefits: [
        "Highlight Care Services – Specify specialties like Alzheimer's care or pediatric support",
        "Manage Workforce Data – Keep caregiver credentials current",
        "Boost Discoverability – Improve rankings in family searches"
      ]
    },
    {
      title: "Access Professional Tools",
      description: "A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.",
      icon: ClipboardCheck,
      benefits: [
        "Automate Essential Processes – Simplify onboarding and compliance tracking",
        "Streamline Job Admin Tasks – Manage documentation and invoicing",
        "Support Professional Growth – Access structured career tools"
      ]
    },
    {
      title: "Learn More – Caregiver Learning Hub",
      description: "A dedicated learning space with courses, certifications, and best practices for career advancement.",
      icon: GraduationCap,
      benefits: [
        "Upskill & Certify – Access verified courses in specialized fields",
        "Enhance Patient Care – Learn latest techniques and practices",
        "Advance Your Career – Gain valuable credentials"
      ]
    },
    {
      title: "Learn More – Agency Training & Development Hub",
      description: "A training center for agencies offering certifications, compliance training, and workforce development.",
      icon: GraduationCap,
      benefits: [
        "Improve Care Quality – Train staff in latest methodologies",
        "Stay Compliant – Meet industry standards and requirements",
        "Scale with Confidence – Expand while maintaining standards"
      ]
    },
    {
      title: "Community Dashboard (After Registration)",
      description: "A centralized hub for community engagement, support, and caregiving advocacy.",
      icon: Users,
      benefits: [
        "Easy Onboarding – Access volunteering and resource sharing",
        "Connect & Engage – Find those who need support",
        "Support Your Community – Participate in meaningful initiatives"
      ]
    },
    {
      title: "Find Care Circles",
      description: "A community-driven support system for knowledge sharing and mutual support.",
      icon: HeartHandshake,
      benefits: [
        "Peer Support – Connect with others in similar situations",
        "Collaborative Problem-Solving – Share resources and solutions",
        "Community-Led Advocacy – Strengthen caregiver voices"
      ]
    },
    {
      title: "View Events",
      description: "A calendar system for community meetups, workshops, and advocacy events.",
      icon: Calendar,
      benefits: [
        "Stay Informed – Get notified about upcoming events",
        "Skill Development – Join educational workshops",
        "Strengthen Networks – Participate in advocacy initiatives"
      ]
    },
    {
      title: "Get Involved",
      description: "A volunteer portal for supporting families and caregivers through mentorship and assistance.",
      icon: HeartHandshake,
      benefits: [
        "Give Back to the Community – Offer your skills and time",
        "Strengthen Care Networks – Build deeper relationships",
        "Lead Meaningful Initiatives – Champion caregiving awareness"
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      {additionalFeatures.map((feature, index) => (
        <Card key={index} className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <feature.icon className="w-8 h-8 text-primary-600" />
              <CardTitle className="text-2xl">{feature.title}</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {feature.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {feature.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 space-y-4">
              <Link to="/auth" className="block w-full">
                <Button className="w-full">
                  Get Started
                </Button>
              </Link>
              <UpvoteFeatureButton
                featureTitle={feature.title}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="lg:col-span-3 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
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
  );
};

export default FeaturesGrid;
