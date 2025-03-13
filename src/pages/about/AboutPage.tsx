
import { useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumbs/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { StoryCard } from '@/components/about/StoryCard';
import { PodcastCard } from '@/components/about/PodcastCard';
import { MissionCard } from '@/components/about/MissionCard';
import { TeamMemberCard } from '@/components/about/TeamMemberCard';
import { VisionSection } from '@/components/about/VisionSection';
import { Heart, Users, Lightbulb, Globe } from 'lucide-react';

const AboutPage = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Container>
        <Breadcrumb />
        <div className="space-y-8 py-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-primary-800 tracking-tight">
              About Tavara.care
            </h1>
            <p className="text-lg text-gray-600">
              Transforming caregiving through community, connection, and compassion
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <StoryCard 
              isActive={activeCard === 'story'} 
              onClick={() => handleCardClick('story')} 
            />
            <MissionCard 
              isActive={activeCard === 'mission'} 
              onClick={() => handleCardClick('mission')} 
            />
          </div>

          <VisionSection />

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-primary-50">
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <Heart className="h-5 w-5" /> Compassion
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  We believe in treating every caregiver, family, and care recipient with kindness, 
                  understanding, and respect. Our platform is built on compassionate support that 
                  acknowledges the challenges and celebrates the rewards of caregiving.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-primary-50">
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <Users className="h-5 w-5" /> Community
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Tavara.care was built on the principle that no caregiver should feel alone. 
                  We provide spaces for connection, resource sharing, and mutual support that 
                  empower caregivers through collective wisdom and shared experiences.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-primary-50">
                <CardTitle className="flex items-center gap-2 text-primary-700">
                  <Lightbulb className="h-5 w-5" /> Innovation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  We continuously evolve our platform with cutting-edge technology that simplifies 
                  caregiving logistics, facilitates learning, and connects people to the right resources 
                  at the right time, always keeping the human element at the center.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <PodcastCard />
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-center mb-8 text-primary-800">
              The Team Behind Tavara.care
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <TeamMemberCard
                name="Jane Doe"
                role="Co-Founder & CEO"
                bio="With over 15 years of experience in healthcare and a personal journey as a caregiver, Jane brings deep insight and passion to Tavara.care."
                imageSrc="/placeholder.svg"
              />
              <TeamMemberCard
                name="John Smith"
                role="Co-Founder & CTO"
                bio="John combines his technical expertise with a profound understanding of caregiver needs, driving innovation that makes a real difference."
                imageSrc="/placeholder.svg"
              />
              <TeamMemberCard
                name="Emily Johnson"
                role="Head of Community"
                bio="Emily's background in social work and community building helps create meaningful connections between caregivers across the Tavara.care platform."
                imageSrc="/placeholder.svg"
              />
            </div>
          </div>

          <div className="flex justify-center mt-16 mb-8">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
              <Globe className="mr-2 h-5 w-5" />
              Join the Tavara.care Community
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
