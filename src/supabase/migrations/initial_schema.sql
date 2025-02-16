
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT CHECK (role IN ('family', 'professional', 'community')),
  full_name TEXT,
  avatar_url TEXT,
  CONSTRAINT valid_role CHECK (role IN ('family', 'professional', 'community'))
);

-- Create care plans table
CREATE TABLE care_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  family_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- Create care tasks table
CREATE TABLE care_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed'))
);

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('medical', 'care_plan', 'other'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only read profiles they have access to and update their own
CREATE POLICY "Profiles are viewable by users who have access" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM care_plans cp
      WHERE cp.family_id = profiles.id
      AND (
        auth.uid() = cp.family_id
        OR EXISTS (
          SELECT 1 FROM care_tasks ct
          WHERE ct.care_plan_id = cp.id
          AND ct.assigned_to = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Care Plans: Families can CRUD their own plans, professionals can view assigned plans
CREATE POLICY "Care plans are viewable by involved users" ON care_plans
  FOR SELECT USING (
    family_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM care_tasks
      WHERE care_plan_id = id
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Only families can create care plans" ON care_plans
  FOR INSERT WITH CHECK (family_id = auth.uid());

CREATE POLICY "Only families can update their care plans" ON care_plans
  FOR UPDATE USING (family_id = auth.uid());

CREATE POLICY "Only families can delete their care plans" ON care_plans
  FOR DELETE USING (family_id = auth.uid());

-- Care Tasks: Assigned users can view and update their tasks
CREATE POLICY "Tasks are viewable by involved users" ON care_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE id = care_plan_id
      AND (
        family_id = auth.uid()
        OR assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY "Only task assignees can update tasks" ON care_tasks
  FOR UPDATE USING (assigned_to = auth.uid());

-- Documents: Access follows care plan access
CREATE POLICY "Documents are viewable by involved users" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE id = care_plan_id
      AND (
        family_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM care_tasks
          WHERE care_plan_id = care_plans.id
          AND assigned_to = auth.uid()
        )
      )
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars'),
       ('documents', 'documents');

-- Set up storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.filename(name) LIKE auth.uid() || '/%')
  );

CREATE POLICY "Documents are accessible by involved users" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM documents d
      JOIN care_plans cp ON d.care_plan_id = cp.id
      WHERE d.file_url LIKE '%' || storage.filename(name)
      AND (
        cp.family_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM care_tasks ct
          WHERE ct.care_plan_id = cp.id
          AND ct.assigned_to = auth.uid()
        )
      )
    )
  );

-- Set up realtime
ALTER PUBLICATION supabase_realtime ADD TABLE care_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE care_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
