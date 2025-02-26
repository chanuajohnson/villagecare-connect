
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

  // Call fetchUsers when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, verify if the current user is an admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized - Admin access required');
      }

      // Fetch all profiles with their auth.user emails using a join
      const { data: userProfiles, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          created_at,
          auth_users!inner(
            email
          )
        `);

      if (usersError) {
        throw usersError;
      }

      const formattedUsers = userProfiles?.map(profile => ({
        id: profile.id,
        email: profile.auth_users?.email,
        role: profile.role,
        created_at: profile.created_at
      })) || [];

      setUsers(formattedUsers);
      console.log('Users loaded:', formattedUsers);

    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (error) {
        throw error;
      }

      toast.success('User deleted successfully');
      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
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
