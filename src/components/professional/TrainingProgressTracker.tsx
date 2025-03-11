
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
      icon: BookOpen,
      progress: 100,
      totalLessons: 3,
      completedLessons: 3,
      estimatedTime: "15 min",
      completed: true
    },
    {
      id: 2,
      title: "Professional Ethics",
      icon: BookOpen,
      progress: 60,
      totalLessons: 5,
      completedLessons: 3,
      estimatedTime: "45 min",
      completed: false
    },
    {
      id: 3,
      title: "Communication Skills",
      icon: BookOpen,
      progress: 25,
      totalLessons: 4,
      completedLessons: 1,
      estimatedTime: "30 min",
      completed: false
    },
    {
      id: 4,
      title: "Safety Protocols",
      icon: BookOpen,
      progress: 0,
      totalLessons: 6,
      completedLessons: 0,
      estimatedTime: "60 min",
      completed: false
    }
  ];

  const totalProgress = 45; // This would be calculated based on all modules

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary-600" />
            <CardTitle className="text-2xl">Training Progress</CardTitle>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-md text-gray-600">Your learning journey</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">{totalProgress}%</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Training Modules */}
          <div className="space-y-5">
            {trainingModules.map((module) => (
              <div key={module.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {module.completed ? (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                        <Award className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600">
                        <module.icon className="h-5 w-5" />
                      </span>
                    )}
                    <span className="font-medium text-lg">{module.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {module.completedLessons}/{module.totalLessons} lessons • {module.estimatedTime}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      module.completed 
                        ? 'bg-green-500' 
                        : 'bg-primary-500'
                    }`}
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Continue Training Button */}
          <Link 
            to="/professional/training-resources" 
            className="block w-full"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full flex justify-between items-center border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-lg py-6"
            >
              <span className="text-lg">Continue Training</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          {/* Certificates Section */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600">
                <Award className="h-5 w-5" />
              </span>
              <span className="font-medium text-lg">1 Certificate Earned</span>
            </div>
            <Link to="/professional/training-resources">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 text-lg">
                View All
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
