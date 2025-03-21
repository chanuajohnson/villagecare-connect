import { supabase } from '@/lib/supabase';
import { CarePlan, CareTask } from '@/types/care-management';

export async function createCarePlan(carePlan: Partial<CarePlan>) {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert([carePlan])
      .select()
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }

    return data as CarePlan;
  } catch (error) {
    console.error('Error creating care plan:', error);
    throw error;
  }
}

export async function updateCarePlan(id: string, updates: Partial<CarePlan>) {
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

    return data as CarePlan;
  } catch (error) {
    console.error('Error updating care plan:', error);
    throw error;
  }
}

// Add these missing functions
export async function fetchCarePlans(userId: string) {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data as CarePlan[];
  } catch (error) {
    console.error('Error fetching care plans:', error);
    return [];
  }
}

export async function fetchCareTasks(carePlanId: string) {
  try {
    const { data, error } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('care_plan_id', carePlanId);
      
    if (error) throw error;
    
    return data as CareTask[];
  } catch (error) {
    console.error('Error fetching care tasks:', error);
    return [];
  }
}

export async function fetchCarePlan(id: string) {
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

    return data as CarePlan;
  } catch (error) {
    console.error('Error fetching care plan:', error);
    throw error;
  }
}

export async function deleteCarePlan(id: string) {
  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting care plan:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting care plan:', error);
    return false;
  }
}
