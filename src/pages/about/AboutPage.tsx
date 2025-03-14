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
import { Heart, Users, Lightbulb, Globe, Briefcase, GraduationCap, Headphones, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
const AboutPage = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const handleCardClick = (cardId: string) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };
  const moduleList = [{
    id: "module1",
    title: "Module 1: Caregiving Basics & Professionalism",
    description: "Understanding the role of a caregiver, key responsibilities, ethics, and expectations."
  }, {
    id: "module2",
    title: "Module 2: Elderly & Special Needs Care",
    description: "Knowledge and practical skills to care for elderly individuals and children with special needs."
  }, {
    id: "module3",
    title: "Module 3: Safety & Emergency Preparedness",
    description: "Ensuring safety and well-being of both caregivers and care recipients."
  }, {
    id: "module4",
    title: "Module 4: Emotional & Social Support",
    description: "Essential skills for providing emotional and social support to clients and families."
  }, {
    id: "module5",
    title: "Module 5: Hands-On Care Techniques",
    description: "Essential hands-on skills for safely assisting with activities of daily living."
  }, {
    id: "module6",
    title: "Module 6: Working with Families & Agencies",
    description: "Navigating relationships with families and agencies, contracts, and professional conduct."
  }, {
    id: "module7",
    title: "Module 7: Legal & Ethical Considerations (Bonus Module)",
    description: "Legal, ethical, and human rights aspects of caregiving."
  }];
  const teamMembers = [{
    name: "Jane Doe",
    role: "Co-Founder & CEO",
    bio: "With over 15 years of experience in healthcare and a personal journey as a caregiver, Jane brings deep insight and passion to Tavara.care.",
    imageSrc: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  }, {
    name: "John Smith",
    role: "Co-Founder & CTO",
    bio: "John combines his technical expertise with a profound understanding of caregiver needs, driving innovation that makes a real difference.",
    imageSrc: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  }, {
    name: "Emily Johnson",
    role: "Head of Community",
    bio: "Emily's background in social work and community building helps create meaningful connections between caregivers across the Tavara.care platform.",
    imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  }];
  return <div className="min-h-screen bg-white">
      <Container>
        <Breadcrumb />
        <div className="space-y-8 py-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="text-4xl font-bold text-primary-800 tracking-tight">
              About Tavara
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="text-lg text-gray-600">
              It takes a village to care
            </motion.p>
          </div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
            <p className="text-gray-600 leading-relaxed">
              Tavara is dedicated to empowering caregivers with the necessary skills, heart, and purpose to provide high-quality home care 
              in Trinidad & Tobago. Our structured Professional Caregiver Training Program equips caregivers with the skills, knowledge, and 
              cultural understanding required to provide compassionate care for the elderly, individuals with disabilities, and those with 
              specialized medical needs.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">The name "Tavara" meaning blessing, symbolizing the precious gift of care nurtured and shared within a community. Tavara reflects a modern village, a network where caregivers, families, and agencies unite to uplift care standards through a technology-enabled platform.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <StoryCard isActive={activeCard === 'story'} onClick={() => handleCardClick('story')} />
            <MissionCard isActive={activeCard === 'mission'} onClick={() => handleCardClick('mission')} />
          </div>

          <VisionSection />

          <div className="mt-16">
            <div className="text-center mb-10">
              <motion.h2 initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }} className="text-3xl font-bold text-primary-800 mb-4">
                Our Comprehensive Training Program
              </motion.h2>
              <motion.p initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} className="text-lg text-gray-600 max-w-2xl mx-auto">
                A three-step approach blending self-paced learning, hands-on experience, and career development
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }}>
                <Card className="h-full">
                  <div className="bg-primary-100 p-6 flex justify-center items-center">
                    <GraduationCap className="h-16 w-16 text-primary-700" />
                  </div>
                  <CardHeader>
                    <CardTitle>Step 1: Self-Paced Online Training</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Professionally produced pre-recorded video lessons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Progress tracking and completion certificates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Knowledge quizzes and guided reflection prompts</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }}>
                <Card className="h-full">
                  <div className="bg-primary-200 p-6 flex justify-center items-center">
                    <Users className="h-16 w-16 text-primary-700" />
                  </div>
                  <CardHeader>
                    <CardTitle>Step 2: Shadowing a Professional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Mentor matching with experienced professionals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Hands-on observation during real caregiving shifts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Guided reflection and final readiness assessment</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }} viewport={{
              once: true
            }}>
                <Card className="h-full">
                  <div className="bg-primary-300 p-6 flex justify-center items-center">
                    <Briefcase className="h-16 w-16 text-primary-700" />
                  </div>
                  <CardHeader>
                    <CardTitle>Step 3: Career Development</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Professional job-matching platform access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Caregiver network for referrals and mentorship</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold">•</span>
                        <span>Advanced specialty training opportunities</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <div className="mt-16">
            <div className="text-center mb-8">
              <motion.h2 initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }} className="text-3xl font-bold text-primary-800 mb-4">
                Training Course Modules
              </motion.h2>
              <motion.p initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our comprehensive curriculum covers everything a caregiver needs to know
              </motion.p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="module1" className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-7 h-auto">
                  {moduleList.map((module, index) => <TabsTrigger key={module.id} value={module.id} className="text-xs sm:text-sm py-2">
                      Module {index + 1}
                    </TabsTrigger>)}
                </TabsList>
                {moduleList.map(module => <TabsContent key={module.id} value={module.id} className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          This module is designed to provide caregivers with the essential knowledge and skills 
                          needed to deliver professional and compassionate care in alignment with Trinidad & Tobago's 
                          cultural context and healthcare standards.
                        </p>
                        <Button variant="outline" className="mt-4">
                          Learn more about this module
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>)}
              </Tabs>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} viewport={{
            once: true
          }}>
              <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow h-full">
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
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} viewport={{
            once: true
          }}>
              <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow h-full">
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
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.4
          }} viewport={{
            once: true
          }}>
              <Card className="overflow-hidden border-primary-100 hover:shadow-lg transition-shadow h-full">
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
            </motion.div>
          </div>

          <div className="mt-16">
            <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} viewport={{
            once: true
          }} className="text-2xl font-semibold text-center mb-8 text-primary-800">The Tavara Platform</motion.h2>
            
            <NavigationMenu className="mx-auto max-w-4xl mb-10">
              <NavigationMenuList className="flex flex-col sm:flex-row justify-center gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary-50">For Families</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3 p-4">
                        <div className="row-span-3">
                          <h4 className="text-lg font-medium leading-none mb-2">Family Features</h4>
                          <p className="text-sm leading-snug text-muted-foreground mb-4">
                            Tools to coordinate care for your loved ones effectively.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Plans</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Caregiver Matching</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Medication Tracking</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Appointment Management</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Team Coordination</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Activity Monitoring</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary-50">For Professionals</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3 p-4">
                        <div className="row-span-3">
                          <h4 className="text-lg font-medium leading-none mb-2">Professional Features</h4>
                          <p className="text-sm leading-snug text-muted-foreground mb-4">
                            Resources to enhance your caregiving career.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Profile Showcase</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Job Opportunities</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Client Management</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Tracking</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Training Resources</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Professional Growth</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-primary-50">For Community</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3 p-4">
                        <div className="row-span-3">
                          <h4 className="text-lg font-medium leading-none mb-2">Community Features</h4>
                          <p className="text-sm leading-snug text-muted-foreground mb-4">
                            Ways to contribute to the caregiving community.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Care Circles</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Resource Sharing</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Community Events</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Support Services</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Family Connections</div>
                            <div className="text-sm flex gap-1"><Award className="h-4 w-4" /> Impact Tracking</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-8 shadow-inner max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Profile Management</h4>
                    <p className="text-sm text-gray-600">Customized for different user roles</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Care Management</h4>
                    <p className="text-sm text-gray-600">Activity logs, team chat, care reports</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Medication Management</h4>
                    <p className="text-sm text-gray-600">Reminders and tracking tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Caregiver Learning Hub</h4>
                    <p className="text-sm text-gray-600">Training modules and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Community Features</h4>
                    <p className="text-sm text-gray-600">Care circles, events, resource sharing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-primary-700">Emergency Alerts</h4>
                    <p className="text-sm text-gray-600">Fall detection and emergency notifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <PodcastCard />
          </div>

          <div className="mt-16">
            <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} viewport={{
            once: true
          }} className="text-2xl font-semibold text-center mb-8 text-primary-800">
              The Team Behind Tavara.care
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => <motion.div key={member.name} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: index * 0.2
            }} viewport={{
              once: true
            }}>
                  <TeamMemberCard name={member.name} role={member.role} bio={member.bio} imageSrc={member.imageSrc} />
                </motion.div>)}
            </div>
          </div>

          <div className="flex justify-center mt-16 mb-8">
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Link to="/features">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                  <Globe className="mr-2 h-5 w-5" />
                  Join the Tavara.care Community
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>;
};
export default AboutPage;