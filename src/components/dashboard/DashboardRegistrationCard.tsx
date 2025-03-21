
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export interface DashboardRegistrationCardProps {
  userType: string;
  completedSteps: string[];
  totalSteps: number;
  registrationPath: string;
}

export function DashboardRegistrationCard({ 
  userType, 
  completedSteps, 
  totalSteps, 
  registrationPath 
}: DashboardRegistrationCardProps) {
  const navigate = useNavigate();
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Finish your {userType} profile to unlock all features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Profile Completion</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            {completedSteps.length < totalSteps ? (
              <p className="text-sm text-muted-foreground">
                Complete your profile to improve matching results and access all features.
              </p>
            ) : (
              <p className="text-sm text-green-600">
                Great job! Your profile is complete.
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {completedSteps.length < totalSteps ? (
          <Button onClick={() => navigate(registrationPath)} className="w-full">
            Continue Registration
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Profile Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
