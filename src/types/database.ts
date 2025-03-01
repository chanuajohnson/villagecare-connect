// User roles in the system
export type UserRole = 'family' | 'professional' | 'community' | 'admin';

// Database table definitions and types
export interface Profile {
  id: string;
  created_at?: string;
  updated_at?: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  // Additional profile fields can be added here
}

export interface CarePlan {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  family_id: string;
  // Other care plan fields
}

// Add more database types as needed
