
export type UserRole = 'family' | 'professional' | 'community' | 'admin';

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
}

export interface CarePlan {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  family_id: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface CareTask {
  id: string;
  created_at: string;
  updated_at: string;
  care_plan_id: string;
  assigned_to: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Document {
  id: string;
  created_at: string;
  care_plan_id: string;
  name: string;
  file_url: string;
  uploaded_by: string;
  type: 'medical' | 'care_plan' | 'other';
}
