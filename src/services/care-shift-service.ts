
import { supabase } from '@/lib/supabase';
import { CareShift, CalendarEvent } from '@/types/care-management';
import { toast } from 'sonner';

export const fetchCareShifts = async (carePlanId: string): Promise<CareShift[]> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .eq('care_plan_id', carePlanId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching care shifts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCareShifts:', error);
    toast.error('Failed to fetch care shifts. Please try again.');
    return [];
  }
};

export const fetchCareShiftsByFamily = async (familyId: string): Promise<CareShift[]> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .eq('family_id', familyId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching care shifts by family:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCareShiftsByFamily:', error);
    toast.error('Failed to fetch care shifts. Please try again.');
    return [];
  }
};

export const fetchCareShiftsByCaregiver = async (caregiverId: string): Promise<CareShift[]> => {
  try {
    // Get shifts directly assigned to caregiver
    const { data: assignedShifts, error: assignedError } = await supabase
      .from('care_shifts')
      .select(`
        *,
        family:family_id(full_name, avatar_url)
      `)
      .eq('caregiver_id', caregiverId)
      .order('start_time', { ascending: true });

    if (assignedError) {
      console.error('Error fetching assigned care shifts:', assignedError);
      throw assignedError;
    }

    // Get open shifts from care plans where caregiver is a team member
    const { data: teamShifts, error: teamError } = await supabase
      .from('care_shifts')
      .select(`
        *,
        family:family_id(full_name, avatar_url),
        care_plan_id!inner(id),
        care_team_members!inner(caregiver_id, status)
      `)
      .eq('care_team_members.caregiver_id', caregiverId)
      .eq('care_team_members.status', 'active')
      .is('caregiver_id', null)
      .eq('status', 'open')
      .order('start_time', { ascending: true });

    if (teamError) {
      console.error('Error fetching team care shifts:', teamError);
      throw teamError;
    }

    return [...(assignedShifts || []), ...(teamShifts || [])];
  } catch (error) {
    console.error('Error in fetchCareShiftsByCaregiver:', error);
    toast.error('Failed to fetch care shifts. Please try again.');
    return [];
  }
};

export const createCareShift = async (careShift: Omit<CareShift, 'id' | 'created_at' | 'updated_at' | 'caregiver'>): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .insert(careShift)
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating care shift:', error);
      throw error;
    }

    toast.success('Care shift created successfully');
    return data;
  } catch (error) {
    console.error('Error in createCareShift:', error);
    toast.error('Failed to create care shift. Please try again.');
    return null;
  }
};

export const updateCareShift = async (id: string, updates: Partial<CareShift>): Promise<CareShift | null> => {
  try {
    // Remove non-updatable fields
    const { caregiver, ...updatableFields } = updates;
    
    const { data, error } = await supabase
      .from('care_shifts')
      .update(updatableFields)
      .eq('id', id)
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating care shift:', error);
      throw error;
    }

    toast.success('Care shift updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateCareShift:', error);
    toast.error('Failed to update care shift. Please try again.');
    return null;
  }
};

export const deleteCareShift = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_shifts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting care shift:', error);
      throw error;
    }

    toast.success('Care shift deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteCareShift:', error);
    toast.error('Failed to delete care shift. Please try again.');
    return false;
  }
};

// Caregiver functions for shift management
export const requestShift = async (shiftId: string, caregiverId: string): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .update({
        caregiver_id: caregiverId,
        status: 'requested'
      })
      .eq('id', shiftId)
      .eq('status', 'open') // Can only request open shifts
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error requesting care shift:', error);
      throw error;
    }

    toast.success('Shift requested successfully');
    return data;
  } catch (error) {
    console.error('Error in requestShift:', error);
    toast.error('Failed to request shift. Please try again.');
    return null;
  }
};

export const confirmShift = async (shiftId: string, caregiverId: string): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .update({
        status: 'confirmed'
      })
      .eq('id', shiftId)
      .eq('caregiver_id', caregiverId)
      .eq('status', 'requested') // Can only confirm requested shifts
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error confirming care shift:', error);
      throw error;
    }

    toast.success('Shift confirmed successfully');
    return data;
  } catch (error) {
    console.error('Error in confirmShift:', error);
    toast.error('Failed to confirm shift. Please try again.');
    return null;
  }
};

export const cancelShift = async (shiftId: string): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .update({
        status: 'cancelled'
      })
      .eq('id', shiftId)
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error cancelling care shift:', error);
      throw error;
    }

    toast.success('Shift cancelled successfully');
    return data;
  } catch (error) {
    console.error('Error in cancelShift:', error);
    toast.error('Failed to cancel shift. Please try again.');
    return null;
  }
};

export const reopenShift = async (shiftId: string): Promise<CareShift | null> => {
  try {
    const { data, error } = await supabase
      .from('care_shifts')
      .update({
        caregiver_id: null,
        status: 'open'
      })
      .eq('id', shiftId)
      .select(`
        *,
        caregiver:caregiver_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error reopening care shift:', error);
      throw error;
    }

    toast.success('Shift reopened successfully');
    return data;
  } catch (error) {
    console.error('Error in reopenShift:', error);
    toast.error('Failed to reopen shift. Please try again.');
    return null;
  }
};

// Google Calendar integration functions
export const syncShiftWithGoogleCalendar = async (shiftId: string, googleEventId: string, calendarId: string): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .upsert({
        care_shift_id: shiftId,
        google_event_id: googleEventId,
        calendar_id: calendarId,
        last_synced: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing with Google Calendar:', error);
      throw error;
    }

    // Update the care shift with the Google Calendar event ID
    await supabase
      .from('care_shifts')
      .update({
        google_calendar_event_id: googleEventId
      })
      .eq('id', shiftId);

    return data;
  } catch (error) {
    console.error('Error in syncShiftWithGoogleCalendar:', error);
    toast.error('Failed to sync with Google Calendar. Please try again.');
    return null;
  }
};
