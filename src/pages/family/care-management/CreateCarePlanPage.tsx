
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { createCarePlan } from "@/services/care-plan-service";
import { toast } from "sonner";

// Define shift types for selection
type ShiftOption = {
  id: string;
  label: string;
  description: string;
  days: string;
  hours: string;
};

const weekdayPrimaryOptions: ShiftOption[] = [
  {
    id: "weekday-option-1",
    label: "Primary Weekday Option 1",
    description: "Standard business hours",
    days: "Monday - Friday",
    hours: "8 AM - 4 PM"
  },
  {
    id: "weekday-option-2",
    label: "Primary Weekday Option 2",
    description: "Extended daytime coverage",
    days: "Monday - Friday",
    hours: "6 AM - 6 PM"
  }
];

const weekendPrimaryOptions: ShiftOption[] = [
  {
    id: "weekend-primary",
    label: "Primary Weekend Caregiver",
    description: "Daytime weekend coverage",
    days: "Saturday - Sunday",
    hours: "6 AM - 6 PM"
  }
];

const additionalShiftOptions: ShiftOption[] = [
  {
    id: "weekday-evening",
    label: "Weekday Evening Shift",
    description: "Evening coverage on weekdays",
    days: "Monday - Friday",
    hours: "4 PM - 12 AM"
  },
  {
    id: "weekday-overnight",
    label: "Weekday Overnight Shift",
    description: "Overnight coverage on weekdays",
    days: "Monday - Friday",
    hours: "12 AM - 8 AM"
  },
  {
    id: "weekend-evening",
    label: "Weekend Evening Shift",
    description: "Evening coverage on weekends",
    days: "Saturday - Sunday",
    hours: "6 PM - 2 AM"
  },
  {
    id: "weekend-overnight",
    label: "Weekend Overnight Shift",
    description: "Overnight coverage on weekends",
    days: "Saturday - Sunday",
    hours: "2 AM - 6 AM"
  }
];

const CreateCarePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [planType, setPlanType] = useState("scheduled"); // scheduled, on-demand, both
  const [weekdayOption, setWeekdayOption] = useState("");
  const [weekendOption, setWeekendOption] = useState("");
  const [additionalShifts, setAdditionalShifts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdditionalShiftChange = (shiftId: string) => {
    setAdditionalShifts(prev => {
      if (prev.includes(shiftId)) {
        return prev.filter(id => id !== shiftId);
      } else {
        return [...prev, shiftId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a care plan title");
      return;
    }

    try {
      setLoading(true);
      
      // Gather shift information for storage
      const selectedShifts = {
        planType,
        weekdayPrimary: weekdayOption ? weekdayPrimaryOptions.find(o => o.id === weekdayOption) : null,
        weekendPrimary: weekendOption ? weekendPrimaryOptions.find(o => o.id === weekendOption) : null,
        additionalShifts: additionalShiftOptions.filter(o => additionalShifts.includes(o.id))
      };
      
      // Create the care plan
      await createCarePlan({
        title,
        description,
        family_id: user?.id || "",
        status: "active" as "active" | "completed" | "cancelled",
        plan_details: selectedShifts
      });
      
      toast.success("Care plan created successfully");
      navigate("/family/care-management");
    } catch (error) {
      console.error("Error creating care plan:", error);
      toast.error("Failed to create care plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="create_care_plan_view" additionalData={{ section: "care_management" }} />
      
      <Container className="py-8">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/family/care-management")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Management
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Care Plan</h1>
          <p className="text-muted-foreground mt-1">
            Create a customized care plan with your preferred shift schedule
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Basic Plan Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the basic details about this care plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Care Plan Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Dad's Weekly Care Plan"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any additional details about this care plan"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Plan Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Care Plan Type</CardTitle>
                <CardDescription>
                  Choose what type of care plan you want to create
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={planType} onValueChange={setPlanType} className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="scheduled" id="plan-scheduled" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="plan-scheduled" className="font-medium">
                        Scheduled Care Plan
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Regular, recurring shifts following a consistent schedule
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="on-demand" id="plan-on-demand" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="plan-on-demand" className="font-medium">
                        On-Demand Care Plan
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Flexible shifts that can be posted as needed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="both" id="plan-both" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="plan-both" className="font-medium">
                        Combined Care Plan
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mix of regular scheduled shifts and on-demand care as needed
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            {/* Schedule Selection - only show if scheduled or both */}
            {(planType === "scheduled" || planType === "both") && (
              <>
                {/* Weekday Primary Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Weekday Coverage</CardTitle>
                    <CardDescription>
                      Select your preferred primary weekday coverage option
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={weekdayOption} onValueChange={setWeekdayOption} className="space-y-4">
                      {weekdayPrimaryOptions.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="grid gap-1.5 flex-1">
                            <Label htmlFor={option.id} className="font-medium">
                              {option.label}
                            </Label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{option.days}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{option.hours}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Weekend Primary Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Weekend Coverage</CardTitle>
                    <CardDescription>
                      Select your preferred primary weekend coverage option
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={weekendOption} onValueChange={setWeekendOption} className="space-y-4">
                      {weekendPrimaryOptions.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="grid gap-1.5 flex-1">
                            <Label htmlFor={option.id} className="font-medium">
                              {option.label}
                            </Label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{option.days}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{option.hours}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Additional Shifts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Coverage</CardTitle>
                    <CardDescription>
                      Select any additional shifts needed to complete your 24-hour coverage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {additionalShiftOptions.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={option.id} 
                            checked={additionalShifts.includes(option.id)}
                            onCheckedChange={() => handleAdditionalShiftChange(option.id)}
                          />
                          <div className="grid gap-1.5 flex-1">
                            <Label htmlFor={option.id} className="font-medium">
                              {option.label}
                            </Label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{option.days}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{option.hours}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Care Plan"}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default CreateCarePlanPage;
