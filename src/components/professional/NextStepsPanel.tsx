
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NextStepsPanelProps {
  completedSteps: string[];
}

export function NextStepsPanel({ completedSteps }: NextStepsPanelProps) {
  const navigate = useNavigate();
  
  const steps = [
    { id: "profile", label: "Complete your profile", path: "/register/professional" },
    { id: "certification", label: "Upload certification", path: "/register/professional" },
    { id: "preferences", label: "Set your preferences", path: "/register/professional" },
    { id: "background_check", label: "Background check", path: "/register/professional" },
  ];
  
  const progress = Math.round((completedSteps.length / steps.length) * 100);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Next Steps
          <span className="text-sm font-normal text-muted-foreground">{progress}% Complete</span>
        </CardTitle>
        <CardDescription>Tasks to complete to improve your matching</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <li key={step.id} className="flex items-start gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                    {step.label}
                  </p>
                  {!isCompleted && (
                    <p className="text-sm text-muted-foreground">
                      {step.id === "profile" && "Provide your basic information"}
                      {step.id === "certification" && "Upload your professional certifications"}
                      {step.id === "preferences" && "Set your availability and preferences"}
                      {step.id === "background_check" && "Complete your background check"}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter>
        {completedSteps.length < steps.length ? (
          <Button onClick={() => navigate("/register/professional")} className="w-full">
            Continue Setup
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            All Steps Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
