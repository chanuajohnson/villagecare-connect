
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  email?: string;
  role?: string;
  created_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch users...');
      
      // First, verify if the current user is an admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      console.log('Current user:', user.id);

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized - Admin access required');
      }
      console.log('Admin status verified');

      // Fetch profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, created_at');

      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
        throw profilesError;
      }
      console.log('Fetched profiles:', profiles);

      // Then fetch auth users for these profiles
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Auth users fetch error:', authError);
        throw authError;
      }
      console.log('Fetched auth users:', authUsers);

      // Combine the data
      const formattedUsers = profiles?.map(profile => {
        const authUser = authUsers?.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email,
          role: profile.role,
          created_at: profile.created_at
        };
      }) || [];

      console.log('Combined user data:', formattedUsers);
      setUsers(formattedUsers);

    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      toast.error(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Attempting to delete user:', userId);
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (error) {
        console.error('Delete user error:', error);
        throw error;
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the users list
    } catch (error: any) {
      console.error('Error in handleDeleteUser:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button 
          onClick={fetchUsers} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh Users'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No users found. Click "Refresh Users" to try again.
        </div>
      )}
    </div>
  );
};
