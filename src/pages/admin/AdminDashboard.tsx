
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserManagement } from "@/components/admin/UserManagement";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto py-8">
      <DashboardHeader
        breadcrumbItems={[
          { label: 'Admin', link: '/dashboard/admin' }
        ]}
        loginUrl="/auth"
      />
      
      <div className="mt-8">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;

