import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import LessonCompletionButton from "@/components/professional/LessonCompletionButton";
import { toast } from "sonner";

const ModuleViewerPage = () => {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleAndLessons = async () => {
      try {
        setLoading(true);
        
        // Fetch the module
        const { data: moduleData, error: moduleError } = await supabase
          .from('training_modules')
          .select('*')
          .eq('id', moduleId)
          .single();
        
        if (moduleError) throw moduleError;
        
        // Fetch all lessons for this module
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('module_lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index');
        
        if (lessonsError) throw lessonsError;
        
        setModule(moduleData);
        setLessons(lessonsData);
        
        // If lessonId is provided, find that lesson
        if (lessonId) {
          const lesson = lessonsData.find(l => l.id === lessonId);
          if (lesson) {
            setCurrentLesson(lesson);
          } else {
            // If lesson not found, redirect to the first lesson
            if (lessonsData.length > 0) {
              navigate(`/professional/training-resources/module/${moduleId}/lesson/${lessonsData[0].id}`, { replace: true });
            } else {
              throw new Error("No lessons found for this module");
            }
          }
        } else {
          // If no lessonId, just show the first lesson
          if (lessonsData.length > 0) {
            navigate(`/professional/training-resources/module/${moduleId}/lesson/${lessonsData[0].id}`, { replace: true });
          } else {
            throw new Error("No lessons found for this module");
          }
        }
        
        // Record that the user has started this module
        if (user) {
          const { data: progress, error: progressError } = await supabase
            .from('user_module_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('module_id', moduleId)
            .maybeSingle();
          
          if (progressError) {
            console.error("Error checking progress:", progressError);
          } else if (!progress) {
            // Create initial progress record if one doesn't exist
            await supabase
              .from('user_module_progress')
              .insert({
                user_id: user.id,
                module_id: moduleId,
                status: 'in_progress',
                completed_lessons: 0
              });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching module data:', error);
        setError('Failed to load module content');
        setLoading(false);
      }
    };
    
    fetchModuleAndLessons();
  }, [moduleId, lessonId, navigate, user]);

  const handleLessonComplete = () => {
    // Find the next lesson
    if (lessons.length > 0 && currentLesson) {
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        // Navigate to the next lesson
        const nextLesson = lessons[currentIndex + 1];
        navigate(`/professional/training-resources/module/${moduleId}/lesson/${nextLesson.id}`);
        toast.success("Moving to the next lesson");
      } else {
        // This was the last lesson
        toast.success("Congratulations! You've completed this module.");
        navigate("/professional/training-resources");
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          <span className="ml-2 text-primary-600">Loading lesson content...</span>
        </div>
      </div>
    );
  }

  if (error || !module || !currentLesson) {
    return (
      <div className="container py-8 px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error || "Could not load the lesson content"}</p>
          <Link to="/professional/training-resources">
            <Button className="mt-4">Return to Training Resources</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-6">
        <Link to="/professional/training-resources" className="flex items-center text-primary-600 hover:text-primary-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Training Resources
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{module.title}</h1>
        <div className="flex items-center text-gray-600 mt-2">
          <BookOpen className="h-5 w-5 mr-2" />
          <span>Lesson {currentLesson.order_index + 1} of {lessons.length}: {currentLesson.title}</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">{currentLesson.title}</h2>
          {/* Display the lesson content */}
          <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {/* Previous lesson button */}
        {lessons.findIndex(l => l.id === currentLesson.id) > 0 && (
          <Button
            onClick={() => {
              const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
              const prevLesson = lessons[currentIndex - 1];
              navigate(`/professional/training-resources/module/${moduleId}/lesson/${prevLesson.id}`);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Previous Lesson
          </Button>
        )}
        
        {/* Spacer when there's no previous button */}
        {lessons.findIndex(l => l.id === currentLesson.id) === 0 && (
          <div></div>
        )}
        
        {/* Mark as complete button */}
        <LessonCompletionButton 
          moduleId={moduleId || ''} 
          lessonId={currentLesson.id} 
          totalLessons={lessons.length}
          onComplete={handleLessonComplete} 
        />
      </div>
    </div>
  );
};

export default ModuleViewerPage;
