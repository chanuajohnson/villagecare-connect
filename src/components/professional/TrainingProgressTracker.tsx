
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Award, BookOpen, HandHeart, Users, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const TrainingProgressTracker = () => {
  // This would normally be fetched from the backend
  const trainingSteps = [
    {
      id: "step1",
      title: "Step 1: Self-Paced Online Training",
      modules: [
        {
          id: 1,
          title: "Caregiving Basics & Professionalism",
          icon: BookOpen,
          progress: 100,
          totalLessons: 3,
          completedLessons: 3,
          estimatedTime: "15 min",
        },
        {
          id: 2,
          title: "Elderly & Special Needs Care",
          icon: Heart,
          progress: 60,
          totalLessons: 5,
          completedLessons: 3,
          estimatedTime: "45 min",
        },
        {
          id: 3,
          title: "Safety & Emergency Preparedness",
          icon: Shield,
          progress: 40,
          totalLessons: 4,
          completedLessons: 2,
          estimatedTime: "30 min",
        },
        {
          id: 4,
          title: "Emotional & Social Support",
          icon: Users,
          progress: 20,
          totalLessons: 4,
          completedLessons: 1,
          estimatedTime: "30 min",
        },
        {
          id: 5,
          title: "Hands-On Care Techniques",
          icon: HandHeart,
          progress: 0,
          totalLessons: 6,
          completedLessons: 0,
          estimatedTime: "60 min",
        },
        {
          id: 6,
          title: "Working with Families & Agencies",
          icon: Users,
          progress: 0,
          totalLessons: 4,
          completedLessons: 0,
          estimatedTime: "45 min",
        }
      ]
    },
    {
      id: "step2",
      title: "Step 2: Shadowing Experience",
      progress: 0,
      description: "Hands-on training with experienced mentors",
      status: "Not Started",
      unlocked: false
    },
    {
      id: "step3",
      title: "Step 3: Next Steps",
      progress: 0,
      description: "Career advancement opportunities",
      status: "Locked",
      unlocked: false
    }
  ];

  const totalProgress = Math.round(
    trainingSteps[0].modules.reduce((sum, module) => sum + module.progress, 0) / trainingSteps[0].modules.length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-5 w-5 text-primary-600" />
            Training Progress
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Professional Caregiver Certification</p>
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium">{totalProgress}%</p>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Self-Paced Modules */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">{trainingSteps[0].title}</h3>
            {trainingSteps[0].modules.map((module) => (
              <div key={module.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {module.progress === 100 ? (
                      <Award className="h-4 w-4 text-green-500" />
                    ) : (
                      <module.icon className="h-4 w-4 text-primary-500" />
                    )}
                    <span className="font-medium">{module.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {module.completedLessons}/{module.totalLessons} lessons • {module.estimatedTime}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      module.progress === 100 
                        ? 'bg-green-500' 
                        : module.progress > 0 
                          ? 'bg-primary-500' 
                          : 'bg-gray-200'
                    }`}
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Step 2: Shadowing Experience */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm text-gray-700">{trainingSteps[1].title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                trainingSteps[1].unlocked 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {trainingSteps[1].status}
              </span>
            </div>
            <p className="text-xs text-gray-500">{trainingSteps[1].description}</p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full bg-gray-300 rounded-full transition-all duration-500"
                style={{ width: `${trainingSteps[1].progress}%` }}
              />
            </div>
          </div>

          {/* Step 3: Next Steps */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm text-gray-700">{trainingSteps[2].title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {trainingSteps[2].status}
              </span>
            </div>
            <p className="text-xs text-gray-500">{trainingSteps[2].description}</p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full bg-gray-300 rounded-full transition-all duration-500"
                style={{ width: `${trainingSteps[2].progress}%` }}
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex justify-between items-center border-primary-200 text-primary-700 hover:bg-primary-50" 
              asChild
            >
              <Link to="/professional/training-resources">
                <span>Continue Training</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="pt-2 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">1 Module Completed</span>
            </div>
            <Link to="/professional/training-resources">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                View All
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
