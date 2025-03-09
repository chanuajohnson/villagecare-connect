
import React from 'react';
import { ProfessionalProfileView } from '@/components/professional/ProfessionalProfileView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileViewPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Map
        </Button>
        
        <ProfessionalProfileView />
      </div>
    </div>
  );
};

export default ProfileViewPage;
