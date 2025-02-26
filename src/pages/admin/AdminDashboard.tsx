
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { session, userRole } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }

    if (userRole !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [session, userRole, navigate]);

  if (!session || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <AdminUserManagement />
    </div>
  );
};

export default AdminDashboard;
