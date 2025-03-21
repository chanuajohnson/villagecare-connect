
import { supabase } from '@/lib/supabase';
import { CareTeamMember } from '@/types/care-management';
import { toast } from 'sonner';

export const fetchCareTeamMembers = async (carePlanId: string): Promise<CareTeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url, professional_type, years_of_experience, role)
      `)
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care team members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCareTeamMembers:', error);
    toast.error('Failed to fetch care team members. Please try again.');
    return [];
  }
};

export const fetchCareTeamMembersByFamily = async (familyId: string): Promise<CareTeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url, professional_type, years_of_experience, role)
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care team members by family:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCareTeamMembersByFamily:', error);
    toast.error('Failed to fetch care team members. Please try again.');
    return [];
  }
};

export const fetchCareTeamMembershipsByCaregiver = async (caregiverId: string): Promise<CareTeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .select(`
        *,
        family:family_id(full_name, avatar_url)
      `)
      .eq('caregiver_id', caregiverId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care team memberships by caregiver:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCareTeamMembershipsByCaregiver:', error);
    toast.error('Failed to fetch care team memberships. Please try again.');
    return [];
  }
};

export const addCareTeamMember = async (member: Omit<CareTeamMember, 'id' | 'created_at' | 'updated_at' | 'caregiver'>): Promise<CareTeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('care_team_members')
      .insert(member)
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url, professional_type, years_of_experience, role)
      `)
      .single();

    if (error) {
      console.error('Error adding care team member:', error);
      throw error;
    }

    toast.success('Care team member added successfully');
    return data;
  } catch (error) {
    console.error('Error in addCareTeamMember:', error);
    toast.error('Failed to add care team member. Please try again.');
    return null;
  }
};

export const updateCareTeamMember = async (id: string, updates: Partial<CareTeamMember>): Promise<CareTeamMember | null> => {
  try {
    // Remove non-updatable fields
    const { caregiver, ...updatableFields } = updates;
    
    const { data, error } = await supabase
      .from('care_team_members')
      .update(updatableFields)
      .eq('id', id)
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url, professional_type, years_of_experience, role)
      `)
      .single();

    if (error) {
      console.error('Error updating care team member:', error);
      throw error;
    }

    toast.success('Care team member updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateCareTeamMember:', error);
    toast.error('Failed to update care team member. Please try again.');
    return null;
  }
};

export const removeCareTeamMember = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing care team member:', error);
      throw error;
    }

    toast.success('Care team member removed successfully');
    return true;
  } catch (error) {
    console.error('Error in removeCareTeamMember:', error);
    toast.error('Failed to remove care team member. Please try again.');
    return false;
  }
};

export const searchProfessionals = async (searchTerm: string, excludeIds: string[] = []): Promise<any[]> => {
  try {
    let query = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, professional_type, role')
      .eq('role', 'professional');
    
    if (searchTerm) {
      query = query.ilike('full_name', `%${searchTerm}%`);
    }
    
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    const { data, error } = await query.limit(10);

    if (error) {
      console.error('Error searching professionals:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchProfessionals:', error);
    toast.error('Failed to search professionals. Please try again.');
    return [];
  }
};
