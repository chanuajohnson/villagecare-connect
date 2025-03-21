
import { UserRole } from './database';

export type CarePlanStatus = 'active' | 'completed' | 'cancelled';
export type CareTaskStatus = 'pending' | 'in_progress' | 'completed';
export type CareTeamMemberStatus = 'pending' | 'active' | 'removed';
export type CareTeamMemberRole = 'caregiver' | 'primary' | 'backup';
export type CareShiftStatus = 'open' | 'requested' | 'confirmed' | 'cancelled';

export interface CarePlan {
  id: string;
  created_at: string;
  updated_at: string;
  family_id: string;
  title: string;
  description?: string;
  status: CarePlanStatus;
}

export interface CareTask {
  id: string;
  created_at: string;
  updated_at: string;
  care_plan_id: string;
  assigned_to?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: CareTaskStatus;
}

export interface CareTeamMember {
  id: string;
  created_at: string;
  updated_at: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id: string;
  status: CareTeamMemberStatus;
  role: CareTeamMemberRole;
  notes?: string;
  caregiver?: {
    full_name?: string;
    avatar_url?: string;
    professional_type?: string;
    years_of_experience?: string;
    role: UserRole;
  };
}

export interface CareShift {
  id: string;
  created_at: string;
  updated_at: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id?: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  status: CareShiftStatus;
  google_calendar_event_id?: string;
  location?: string;
  recurring_pattern?: string;
  recurrence_rule?: string;
  caregiver?: {
    full_name?: string;
    avatar_url?: string;
  };
  family?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CalendarEvent {
  id: string;
  created_at: string;
  updated_at: string;
  care_shift_id: string;
  google_event_id: string;
  calendar_id: string;
  sync_token?: string;
  etag?: string;
  last_synced: string;
}
