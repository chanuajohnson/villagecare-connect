
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CarePlan {
  id: string;
  family_id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "cancelled";
  plan_details?: any;
  created_at: string;
  updated_at: string;
}

export interface CarePlanCreateDto {
  family_id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "cancelled";
  plan_details?: any;
}

/**
 * Create a new care plan
 */
export const createCarePlan = async (carePlan: CarePlanCreateDto): Promise<CarePlan> => {
  const { data, error } = await supabase
    .from('care_plans')
    .insert(carePlan)
    .select()
    .single();

  if (error) {
    console.error("Error creating care plan:", error);
    throw new Error(error.message);
  }

  return data as CarePlan;
};

/**
 * Get all care plans for a family
 */
export const getCarePlans = async (familyId: string): Promise<CarePlan[]> => {
  const { data, error } = await supabase
    .from('care_plans')
    .select('*')
    .eq('family_id', familyId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching care plans:", error);
    throw new Error(error.message);
  }

  return data as CarePlan[];
};

/**
 * Get a care plan by ID
 */
export const getCarePlanById = async (planId: string): Promise<CarePlan> => {
  const { data, error } = await supabase
    .from('care_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    console.error("Error fetching care plan:", error);
    throw new Error(error.message);
  }

  return data as CarePlan;
};

/**
 * Update a care plan
 */
export const updateCarePlan = async (planId: string, updates: Partial<Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>>): Promise<CarePlan> => {
  const { data, error } = await supabase
    .from('care_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error("Error updating care plan:", error);
    throw new Error(error.message);
  }

  return data as CarePlan;
};

/**
 * Delete a care plan
 */
export const deleteCarePlan = async (planId: string): Promise<void> => {
  const { error } = await supabase
    .from('care_plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error("Error deleting care plan:", error);
    throw new Error(error.message);
  }
};
