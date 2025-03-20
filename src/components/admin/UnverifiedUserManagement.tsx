
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Loader2, AlertCircle, RefreshCw, Send, Trash, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UnverifiedUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, any>;
};

export const UnverifiedUserManagement = () => {
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UnverifiedUser | null>(null);
  const { user, session } = useAuth();

  const fetchUnverifiedUsers = async () => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch unverified users");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setUnverifiedUsers(data.users || []);
    } catch (err: any) {
      console.error("Error fetching unverified users:", err);
      setError(err.message || "Failed to fetch unverified users");
      toast.error("Error fetching unverified users: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (email: string) => {
    if (!session) return;
    
    try {
      setActionInProgress(email);
      setError(null);

      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: "resend_verification",
          email,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to resend verification email");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Verification email resent to ${email}`);
    } catch (err: any) {
      console.error("Error resending verification:", err);
      setError(err.message || "Failed to resend verification email");
      toast.error("Error resending verification: " + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const confirmDeleteUser = (userToDelete: UnverifiedUser) => {
    setUserToDelete(userToDelete);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!session || !userToDelete) return;
    
    try {
      setActionInProgress(userToDelete.id);
      setError(null);
      setDeleteDialogOpen(false);

      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: "delete_user",
          userId: userToDelete.id,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to delete user");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setUnverifiedUsers(unverifiedUsers.filter(u => u.id !== userToDelete.id));
      toast.success(`User ${userToDelete.email} deleted successfully`);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.message || "Failed to delete user");
      toast.error("Error deleting user: " + err.message);
    } finally {
      setActionInProgress(null);
      setUserToDelete(null);
    }
  };

  const handleManuallyVerify = async (userId: string, email: string) => {
    if (!session) return;
    
    try {
      setActionInProgress(userId);
      setError(null);

      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          action: "manually_verify",
          userId,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to verify user");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setUnverifiedUsers(unverifiedUsers.filter(u => u.id !== userId));
      toast.success(`User ${email} verified successfully`);
    } catch (err: any) {
      console.error("Error verifying user:", err);
      setError(err.message || "Failed to verify user");
      toast.error("Error verifying user: " + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchUnverifiedUsers();
    }
  }, [user, session]);

  if (!user || !session) {
    return (
      <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>You must be signed in as an admin to access this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Unverified Users Management</h2>
        <Button 
          onClick={fetchUnverifiedUsers} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 p-4 rounded-md mb-4 border border-destructive/30">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Error</h3>
              <p className="text-sm text-destructive/90 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border p-4 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground">
          This interface shows users who have signed up but have not verified their email address.
          You can resend verification emails, manually verify users, or delete unverified accounts.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Sign Up Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unverifiedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.email}
                  {user.user_metadata?.role && (
                    <Badge variant="outline" className="ml-2">
                      {user.user_metadata.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Awaiting Verification</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionInProgress === user.email}
                      onClick={() => handleResendVerification(user.email)}
                      title="Resend verification email"
                    >
                      {actionInProgress === user.email ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={actionInProgress === user.id}
                      onClick={() => handleManuallyVerify(user.id, user.email)}
                      title="Manually verify user"
                    >
                      {actionInProgress === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionInProgress === user.id}
                      onClick={() => confirmDeleteUser(user)}
                      title="Delete user"
                    >
                      {actionInProgress === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {unverifiedUsers.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No unverified users found
                </TableCell>
              </TableRow>
            )}
            {isLoading && unverifiedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading unverified users...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for {userToDelete?.email}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
