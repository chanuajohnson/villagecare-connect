
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Award, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const TrainingProgressTracker = () => {
  // This would normally be fetched from the backend
  const trainingModules = [
    {
      id: 1,
      title: "Platform Orientation",
      progress: 100,
      totalLessons: 3,
      completedLessons: 3,
      estimatedTime: "15 min",
    },
    {
      id: 2,
      title: "Professional Ethics",
      progress: 60,
      totalLessons: 5,
      completedLessons: 3,
      estimatedTime: "45 min",
    },
    {
      id: 3,
      title: "Communication Skills",
      progress: 20,
      totalLessons: 4,
      completedLessons: 1,
      estimatedTime: "30 min",
    },
    {
      id: 4,
      title: "Safety Protocols",
      progress: 0,
      totalLessons: 6,
      completedLessons: 0,
      estimatedTime: "60 min",
    }
  ];

  const totalProgress = Math.round(
    trainingModules.reduce((sum, module) => sum + module.progress, 0) / trainingModules.length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-5 w-5 text-purple-500" />
            Training Progress
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Your learning journey</p>
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium">{totalProgress}%</p>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {trainingModules.map((module) => (
            <div key={module.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  {module.progress === 100 ? (
                    <Award className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="font-medium">{module.title}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {module.completedLessons}/{module.totalLessons} lessons • {module.estimatedTime}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    module.progress === 100 
                      ? 'bg-green-500' 
                      : module.progress > 0 
                        ? 'bg-purple-500' 
                        : 'bg-gray-200'
                  }`}
                  style={{ width: `${module.progress}%` }}
                />
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full flex justify-between items-center">
              <span>Continue Training</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="pt-2 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">1 Certificate Earned</span>
            </div>
            <Link to="/professional/features-overview">
              <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-700">
                View All
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
