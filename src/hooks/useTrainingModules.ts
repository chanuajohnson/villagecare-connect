
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { TrainingModule, UserModuleProgress, ModuleStatus } from '@/types/training';
import { toast } from 'sonner';

export const useTrainingModules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<Record<string, UserModuleProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch training modules and user progress
  const fetchModulesAndProgress = async () => {
    setIsLoading(true);
    try {
      // Get all training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('*')
        .order('order_index');
      
      if (modulesError) throw modulesError;
      
      if (user) {
        // Get user progress for modules
        const { data: progressData, error: progressError } = await supabase
          .from('user_module_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) throw progressError;
        
        // Create a map of module_id to progress
        const progressMap: Record<string, UserModuleProgress> = {};
        progressData?.forEach(p => {
          progressMap[p.module_id] = p;
        });
        
        setProgress(progressMap);
      }
      
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching training data:', error);
      toast.error('Failed to load training data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize or update progress for a module
  const initializeModuleProgress = async (moduleId: string, status: ModuleStatus = 'in_progress') => {
    if (!user) return null;
    
    try {
      // Check if progress already exists
      if (progress[moduleId]) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_module_progress')
          .update({
            status,
            last_accessed: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .select()
          .single();
        
        if (error) throw error;
        
        setProgress(prev => ({
          ...prev,
          [moduleId]: data
        }));
        
        return data;
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('user_module_progress')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            status,
            completed_lessons: 0
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setProgress(prev => ({
          ...prev,
          [moduleId]: data
        }));
        
        return data;
      }
    } catch (error) {
      console.error('Error initializing module progress:', error);
      toast.error('Failed to update progress');
      return null;
    }
  };

  // Update progress for completed lesson
  const completeLesson = async (moduleId: string, currentCompleted: number, totalLessons: number) => {
    if (!user) return null;

    try {
      const newCompletedCount = currentCompleted + 1;
      const status: ModuleStatus = newCompletedCount >= totalLessons ? 'completed' : 'in_progress';
      
      const { data, error } = await supabase
        .from('user_module_progress')
        .update({
          status,
          completed_lessons: newCompletedCount,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .select()
        .single();
      
      if (error) throw error;
      
      setProgress(prev => ({
        ...prev,
        [moduleId]: data
      }));
      
      toast.success('Lesson completed!');
      return data;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast.error('Failed to update lesson progress');
      return null;
    }
  };

  // Calculate overall progress percentage
  const calculateOverallProgress = (): number => {
    if (!modules.length) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    modules.forEach(module => {
      totalLessons += module.total_lessons;
      // Only count completed lessons for modules that have been started
      if (progress[module.id]) {
        completedLessons += progress[module.id]?.completed_lessons || 0;
      }
    });
    
    return totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  // Get enhanced module list with progress info
  const getEnhancedModules = () => {
    return modules.map(module => {
      const moduleProgress = progress[module.id];
      return {
        ...module,
        progress: moduleProgress ? 
          Math.round((moduleProgress.completed_lessons / module.total_lessons) * 100) : 0,
        completedLessons: moduleProgress?.completed_lessons || 0,
        status: moduleProgress?.status || 'not_started',
        lastAccessed: moduleProgress?.last_accessed
      };
    });
  };

  useEffect(() => {
    fetchModulesAndProgress();
  }, [user]);

  return {
    modules: getEnhancedModules(),
    isLoading,
    initializeModuleProgress,
    completeLesson,
    calculateOverallProgress,
    refreshData: fetchModulesAndProgress
  };
};
