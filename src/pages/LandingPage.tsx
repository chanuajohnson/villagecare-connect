
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Takes a Village</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A community platform connecting families with professional caregivers and community resources.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/auth')}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
