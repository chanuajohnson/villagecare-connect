
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(profiles || []);
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      setIsLoadingSubscriptions(true);
      
      // Fetch subscription events from the tracking table
      const { data, error } = await supabase
        .from('cta_engagement_tracking')
        .select('*, profiles(first_name, last_name, role)')
        .or('action_type.eq.subscription_plan_selected,action_type.eq.subscription_completed')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error('Error fetching subscription data: ' + error.message);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoadingDelete(userId);
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
      });

      if (error) {
        throw error;
      }

      toast.success('User deleted successfully');
      // Remove the deleted user from the local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    } finally {
      setIsLoadingDelete(null);
    }
  };

  // Use useEffect instead of useState for initial fetch
  useEffect(() => {
    fetchUsers();
    fetchSubscriptionData();
  }, []); // Empty dependency array means this only runs once when component mounts

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <Button onClick={fetchUsers} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isLoadingDelete === user.id || user.role === 'admin'}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        {isLoadingDelete === user.id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Subscription Tracking</h2>
            <Button onClick={fetchSubscriptionData} disabled={isLoadingSubscriptions}>
              {isLoadingSubscriptions ? "Loading..." : "Refresh"}
            </Button>
          </div>
          
          <div className="bg-muted/30 border p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              This tab shows all subscription-related events from users. In the production version, 
              this would be connected to a payment processor and would show real subscription status.
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {sub.profiles?.first_name} {sub.profiles?.last_name}
                      <div className="text-xs text-muted-foreground">{sub.profiles?.role}</div>
                    </TableCell>
                    <TableCell>
                      {sub.action_type === 'subscription_plan_selected' ? 'Selected Plan' : 
                       sub.action_type === 'subscription_completed' ? 'Completed Subscription' : 
                       sub.action_type}
                    </TableCell>
                    <TableCell>
                      {sub.additional_data?.plan_name || 'Unknown Plan'}
                    </TableCell>
                    <TableCell>
                      {sub.additional_data?.feature_accessed || 'General Access'}
                    </TableCell>
                    <TableCell>
                      {new Date(sub.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {subscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No subscription data available. When users upgrade their plans, events will appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
