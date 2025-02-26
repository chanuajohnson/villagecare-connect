
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useSession } from "@/hooks/useSession";
import { UserManagement } from "@/components/admin/UserManagement";

const AdminDashboard = () => {
  const { session, handleSignOut } = useSession();

  return (
    <div className="container mx-auto py-8">
      <DashboardHeader
        breadcrumbItems={[
          { label: 'Admin', link: '/dashboard/admin' }
        ]}
        session={session}
        onSignOut={handleSignOut}
        loginUrl="/auth"
      />
      
      <div className="mt-8">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
