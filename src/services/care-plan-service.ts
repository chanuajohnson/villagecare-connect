
import { CareTask, CarePlan } from '@/types/care-management';
import { supabase } from '@/lib/supabase';

export const fetchCarePlan = async (carePlanId: string): Promise<CarePlan> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', carePlanId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching care plan:', error);
    throw error;
  }
};

// Add fetchCarePlans function to retrieve all care plans for a user
export const fetchCarePlans = async (userId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching care plans:', error);
    throw error;
  }
};

// Add fetchCareTasks function to retrieve tasks for a care plan
export const fetchCareTasks = async (carePlanId: string): Promise<CareTask[]> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching care tasks:', error);
    throw error;
  }
};

export const createTask = async (task: Omit<CareTask, 'id' | 'created_at' | 'updated_at'>): Promise<CareTask> => {
  try {
    // Ensure title is provided and not optional
    if (!task.title) {
      throw new Error('Task title is required');
    }
    
    const { data, error } = await supabase
      .from('care_tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (task: Partial<CareTask> & { id: string }): Promise<CareTask> => {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .update(task)
      .eq('id', task.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('care_tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getAllCarePlans = async (userId: string): Promise<CarePlan[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching care plans:', error);
    throw error;
  }
};

export const createCarePlan = async (careplan: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>): Promise<CarePlan> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert(careplan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating care plan:', error);
    throw error;
  }
};

export const updateCarePlan = async (careplan: Partial<CarePlan> & { id: string }): Promise<CarePlan> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(careplan)
      .eq('id', careplan.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating care plan:', error);
    throw error;
  }
};

export const deleteCarePlan = async (carePlanId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', carePlanId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting care plan:', error);
    throw error;
  }
};
