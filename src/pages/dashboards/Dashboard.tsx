
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingScreen from '@/components/common/LoadingScreen';

const Dashboard = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
