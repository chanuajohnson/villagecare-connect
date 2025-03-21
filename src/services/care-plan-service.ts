
import { supabase } from '@/lib/supabase';
import { CarePlan, CareTask } from '@/types/care-management';
import { toast } from 'sonner';

export const fetchCarePlans = async (userId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care plans:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCarePlans:', error);
    toast.error('Failed to fetch care plans. Please try again.');
    return [];
  }
};

export const fetchCarePlan = async (id: string): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching care plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchCarePlan:', error);
    toast.error('Failed to fetch care plan. Please try again.');
    return null;
  }
};

export const fetchSharedCarePlans = async (userId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select(`
        *,
        care_team_members!inner(caregiver_id, status)
      `)
      .eq('care_team_members.caregiver_id', userId)
      .eq('care_team_members.status', 'active');

    if (error) {
      console.error('Error fetching shared care plans:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchSharedCarePlans:', error);
    toast.error('Failed to fetch shared care plans. Please try again.');
    return [];
  }
};

export const createCarePlan = async (carePlan: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert(carePlan)
      .select()
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }

    toast.success('Care plan created successfully');
    return data;
  } catch (error) {
    console.error('Error in createCarePlan:', error);
    toast.error('Failed to create care plan. Please try again.');
    return null;
  }
};

export const updateCarePlan = async (id: string, updates: Partial<CarePlan>): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating care plan:', error);
      throw error;
    }

    toast.success('Care plan updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateCarePlan:', error);
    toast.error('Failed to update care plan. Please try again.');
    return null;
  }
};

export const deleteCarePlan = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting care plan:', error);
      throw error;
    }

    toast.success('Care plan deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteCarePlan:', error);
    toast.error('Failed to delete care plan. Please try again.');
    return false;
  }
};

export const fetchCareTasks = async (carePlanId: string): Promise<CareTask[]> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching care tasks:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCareTasks:', error);
    toast.error('Failed to fetch care tasks. Please try again.');
    return [];
  }
};

export const createCareTask = async (careTask: Omit<CareTask, 'id' | 'created_at' | 'updated_at'>): Promise<CareTask | null> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .insert(careTask)
      .select()
      .single();

    if (error) {
      console.error('Error creating care task:', error);
      throw error;
    }

    toast.success('Care task created successfully');
    return data;
  } catch (error) {
    console.error('Error in createCareTask:', error);
    toast.error('Failed to create care task. Please try again.');
    return null;
  }
};

export const updateCareTask = async (id: string, updates: Partial<CareTask>): Promise<CareTask | null> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating care task:', error);
      throw error;
    }

    toast.success('Care task updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateCareTask:', error);
    toast.error('Failed to update care task. Please try again.');
    return null;
  }
};

export const deleteCareTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting care task:', error);
      throw error;
    }

    toast.success('Care task deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteCareTask:', error);
    toast.error('Failed to delete care task. Please try again.');
    return false;
  }
};
