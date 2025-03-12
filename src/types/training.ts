
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  icon: string;
  total_lessons: number;
  estimated_time: string;
  order_index: number;
  created_at?: string;
}

export interface ModuleLesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at?: string;
}

export interface UserModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: ModuleStatus;
  completed_lessons: number;
  last_accessed: string;
  created_at: string;
}
