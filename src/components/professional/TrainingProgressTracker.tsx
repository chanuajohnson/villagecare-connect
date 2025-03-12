
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Award, BookOpen, Shield, Heart, HandHeart, Users, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTrainingModules } from "@/hooks/useTrainingModules";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping for module icons
const iconMap: Record<string, any> = {
  BookOpen,
  Shield,
  Heart,
  HandHeart,
  Users,
  FileText
};

export const TrainingProgressTracker = () => {
  const navigate = useNavigate();
  const { modules, isLoading, calculateOverallProgress, initializeModuleProgress } = useTrainingModules();
  const [isStartingModule, setIsStartingModule] = useState(false);

  const totalProgress = calculateOverallProgress();

  const handleContinueTraining = async () => {
    // Find the first in-progress module or the first not-started module
    const inProgressModule = modules.find(m => m.status === 'in_progress');
    const notStartedModule = modules.find(m => m.status === 'not_started');
    
    if (inProgressModule) {
      navigate(`/professional/training-resources/module/${inProgressModule.id}`);
    } else if (notStartedModule) {
      setIsStartingModule(true);
      await initializeModuleProgress(notStartedModule.id, 'in_progress');
      setIsStartingModule(false);
      navigate(`/professional/training-resources/module/${notStartedModule.id}`);
    } else {
      // All modules completed - navigate to the first one
      if (modules.length > 0) {
        navigate(`/professional/training-resources/module/${modules[0].id}`);
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              <CardTitle className="text-xl font-semibold">Training Progress</CardTitle>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-600">Your learning journey</p>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-2 w-24 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="mb-2">
              <h3 className="text-sm font-medium mb-2 text-primary-700">Step 1: Self-Paced Online Training</h3>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-xl font-semibold">Training Progress</CardTitle>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600">Your learning journey</p>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{totalProgress}%</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Training Program Sections */}
          <div className="mb-2">
            <h3 className="text-sm font-medium mb-2 text-primary-700">Step 1: Self-Paced Online Training</h3>
          </div>

          {/* Training Modules */}
          <div className="space-y-3">
            {modules.map((module) => {
              const Icon = iconMap[module.icon] || BookOpen;
              const hasStarted = module.status !== 'not_started';
              const isCompleted = module.status === 'completed';
              
              return (
                <div key={module.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                          <Award className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="font-medium text-sm">{module.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {hasStarted ? `${module.completedLessons}/${module.total_lessons}` : '0/'}
                      {module.total_lessons} • {module.estimated_time}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${hasStarted ? module.progress : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Continue Training Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex justify-between items-center border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-lg py-4"
            onClick={handleContinueTraining}
            disabled={isStartingModule}
          >
            <span className="text-sm">
              {isStartingModule ? 'Starting module...' : 'Continue Training'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          {/* Certificates Section */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600">
                <Award className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-sm">
                {modules.filter(m => m.status === 'completed').length} Certificate{modules.filter(m => m.status === 'completed').length !== 1 ? 's' : ''} Earned
              </span>
            </div>
            <Link to="/professional/training-resources">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 text-sm h-8 px-3">
                View All
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
