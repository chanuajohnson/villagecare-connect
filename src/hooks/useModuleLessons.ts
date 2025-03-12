
import { useState, useEffect } from 'react';
import { ModuleLesson } from '@/types/training';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useModuleLessons = (moduleId: string) => {
  const [lessons, setLessons] = useState<ModuleLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<ModuleLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('module_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      
      setLessons(data || []);
      if (data && data.length > 0) {
        setCurrentLesson(data[0]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lesson content');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
    }
  };

  const goToNextLesson = () => {
    if (!currentLesson || !lessons.length) return null;
    
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
      return lessons[currentIndex + 1];
    }
    return null;
  };

  const goToPreviousLesson = () => {
    if (!currentLesson || !lessons.length) return;
    
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };

  const getCurrentLessonIndex = () => {
    if (!currentLesson) return 0;
    return lessons.findIndex(l => l.id === currentLesson.id);
  };

  useEffect(() => {
    if (moduleId) {
      fetchLessons();
    }
  }, [moduleId]);

  return {
    lessons,
    currentLesson,
    isLoading,
    goToLesson,
    goToNextLesson,
    goToPreviousLesson,
    getCurrentLessonIndex,
    totalLessons: lessons.length
  };
};
