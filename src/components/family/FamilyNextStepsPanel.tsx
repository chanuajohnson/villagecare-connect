
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface FamilyNextStepsPanelProps {
  completedSteps: string[];
}

export const FamilyNextStepsPanel: React.FC<FamilyNextStepsPanelProps> = ({ completedSteps }) => {
  const steps = [
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add information about your needs",
      path: "/profile/family"
    },
    {
      id: "care-plan",
      title: "Create a care plan",
      description: "Organize care needs and tasks",
      path: "/dashboard/family/care-plans"
    },
    {
      id: "find-caregiver",
      title: "Find a caregiver",
      description: "Browse qualified professionals",
      path: "/dashboard/family/matching"
    },
    {
      id: "tell-story",
      title: "Tell your story",
      description: "Share your journey to find the right match",
      path: "/dashboard/family/tell-their-story"
    }
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary-600">Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          return (
            <div key={step.id} className="flex items-start space-x-2">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-grow">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
              <Link to={step.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 -mr-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FamilyNextStepsPanel;
