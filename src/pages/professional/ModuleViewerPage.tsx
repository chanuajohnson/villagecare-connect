
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, Award } from "lucide-react";
import { useTrainingModules } from "@/hooks/useTrainingModules";
import { useModuleLessons } from "@/hooks/useModuleLessons";
import { toast } from "sonner";

const ModuleViewerPage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const { modules, isLoading: modulesLoading, completeLesson, initializeModuleProgress } = useTrainingModules();
  const { 
    lessons, 
    currentLesson, 
    isLoading: lessonsLoading, 
    goToNextLesson, 
    goToPreviousLesson, 
    getCurrentLessonIndex,
    totalLessons 
  } = useModuleLessons(moduleId || '');

  const isLoading = modulesLoading || lessonsLoading;
  const currentLessonIndex = getCurrentLessonIndex();

  const breadcrumbItems = [
    {
      label: "Professional",
      href: "/dashboard/professional",
    },
    {
      label: "Training Resources",
      href: "/professional/training-resources",
    },
    {
      label: selectedModule?.title || "Module",
      href: `/professional/training-resources/module/${moduleId}`,
    }
  ];

  useEffect(() => {
    if (!moduleId || modulesLoading) return;
    
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(module);
      
      // Initialize module progress if not started
      if (module.status === 'not_started') {
        initializeModuleProgress(moduleId, 'in_progress');
      }
    } else {
      toast.error("Module not found");
      navigate("/professional/training-resources");
    }
  }, [moduleId, modules, modulesLoading]);

  const handleCompleteLesson = async () => {
    if (!moduleId || !selectedModule) return;
    
    setIsCompleting(true);
    
    try {
      await completeLesson(moduleId, selectedModule.completedLessons, selectedModule.total_lessons);
      
      // Check if we have a next lesson
      const nextLesson = goToNextLesson();
      
      // If no next lesson and all lessons completed, show completion message
      if (!nextLesson && selectedModule.completedLessons + 1 >= selectedModule.total_lessons) {
        toast.success("Module completed!", {
          description: "You've earned a certificate for this module!",
          icon: <Award className="h-5 w-5 text-yellow-500" />,
        });
        
        // Navigate back to training resources
        setTimeout(() => {
          navigate("/professional/training-resources");
        }, 2000);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          
          <div className="my-8">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-20 mb-2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    
                    <div className="flex justify-between mt-6">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 my-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{selectedModule?.title}</h1>
              <p className="text-muted-foreground mt-2">
                {selectedModule?.description || 'Complete the lessons to earn your certificate'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => navigate('/professional/training-resources')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Training
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Lesson Navigation Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lessons</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => {
                      const isCompleted = selectedModule?.completedLessons > index;
                      const isCurrent = currentLesson?.id === lesson.id;
                      
                      return (
                        <Button
                          key={lesson.id}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start gap-2 text-left ${
                            isCompleted ? "text-green-600" : ""
                          }`}
                          onClick={() => navigate(`/professional/training-resources/module/${moduleId}/lesson/${lesson.id}`)}
                        >
                          {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {!isCompleted && <BookOpen className="h-4 w-4" />}
                          <span className="truncate">Lesson {index + 1}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Lesson Content */}
            <div className="md:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{currentLesson?.title}</CardTitle>
                  <CardDescription>
                    Lesson {currentLessonIndex + 1} of {totalLessons}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <p>{currentLesson?.content}</p>
                    
                    {/* Sample content - in a real app, this would be rich content from the database */}
                    <h3>Key Points</h3>
                    <ul>
                      <li>Understanding the core concepts of this module</li>
                      <li>Building professional skills in this area</li>
                      <li>Applying best practices in caregiving scenarios</li>
                    </ul>
                    
                    <h3>Practice</h3>
                    <p>
                      Think about how you would apply these principles in your daily caregiving routine.
                      Consider specific scenarios where these skills would be valuable.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                    <h4 className="font-medium text-lg mb-2">Reflection Question</h4>
                    <p>
                      How would you incorporate these techniques into your caregiving approach?
                      What challenges might you face, and how would you overcome them?
                    </p>
                  </div>
                  
                  {/* Navigation and Completion */}
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      disabled={currentLessonIndex === 0}
                      onClick={goToPreviousLesson}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    {currentLessonIndex < totalLessons - 1 ? (
                      <Button 
                        disabled={isCompleting} 
                        onClick={handleCompleteLesson}
                        className="gap-2"
                      >
                        {isCompleting ? 'Completing...' : 'Complete & Continue'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        disabled={isCompleting} 
                        onClick={handleCompleteLesson}
                        className="gap-2"
                      >
                        {isCompleting ? 'Completing...' : 'Complete Module'}
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleViewerPage;
