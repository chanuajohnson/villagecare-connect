
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { createCarePlan } from "@/services/care-plan-service";
import { toast } from "sonner";

type PlanType = 'scheduled' | 'on-demand' | 'both';
type WeekdayOption = '8am-4pm' | '6am-6pm' | 'none';
type WeekendOption = 'yes' | 'no';

const CreateCarePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [planType, setPlanType] = useState<PlanType>("scheduled");
  const [weekdayOption, setWeekdayOption] = useState<WeekdayOption>("8am-4pm");
  const [weekendOption, setWeekendOption] = useState<WeekendOption>("yes");
  
  // Additional shifts
  const [shifts, setShifts] = useState({
    weekdayEvening: false,  // 4PM - 12AM
    weekdayOvernight: false, // 12AM - 8AM
    weekendEvening: false,   // 6PM - 2AM
    weekendOvernight: false  // 2AM - 6AM
  });

  const handleShiftChange = (shift: keyof typeof shifts) => {
    setShifts(prev => ({
      ...prev,
      [shift]: !prev[shift]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a care plan");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please provide a title for your care plan");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare plan details based on selections
      const planDetails = {
        title,
        description,
        family_id: user.id,
        status: 'active' as const,
        metadata: {
          plan_type: planType,
          weekday_coverage: weekdayOption,
          weekend_coverage: weekendOption,
          additional_shifts: shifts
        }
      };
      
      const newPlan = await createCarePlan(planDetails);
      
      if (newPlan) {
        toast.success("Care plan created successfully!");
        navigate("/family/care-management");
      }
    } catch (error) {
      console.error("Error creating care plan:", error);
      toast.error("Failed to create care plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/family/care-management")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Management
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Care Plan</h1>
          <p className="text-muted-foreground mt-1">
            Define a care plan for your loved one with scheduled or on-demand care
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>
                  Provide basic information about this care plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Plan Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Mom's Weekly Care Plan" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the care needs and any special considerations..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Plan Type</CardTitle>
                <CardDescription>
                  Choose how you want to schedule care
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={planType} 
                  onValueChange={(value) => setPlanType(value as PlanType)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="scheduled" className="font-medium">
                        Scheduled Care Plan
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Regularly scheduled caregiving shifts following a consistent pattern.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="on-demand" id="on-demand" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="on-demand" className="font-medium">
                        On-Demand Care
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Flexible care shifts as needed without a regular schedule.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="both" className="font-medium">
                        Both (Scheduled + On-Demand)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Regular scheduled care with additional on-demand support as needed.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            {(planType === "scheduled" || planType === "both") && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Weekday Coverage</CardTitle>
                    <CardDescription>
                      Select your preferred weekday caregiver schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={weekdayOption} 
                      onValueChange={(value) => setWeekdayOption(value as WeekdayOption)}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="8am-4pm" id="option1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="option1" className="font-medium">
                            Option 1: Monday - Friday, 8 AM - 4 PM
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Standard daytime coverage during business hours.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="6am-6pm" id="option2" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="option2" className="font-medium">
                            Option 2: Monday - Friday, 6 AM - 6 PM
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Extended daytime coverage for more comprehensive care.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="none" id="option-none" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="option-none" className="font-medium">
                            No Weekday Coverage
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Skip weekday coverage and use on-demand or other shifts.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Weekend Coverage</CardTitle>
                    <CardDescription>
                      Do you need a primary weekend caregiver?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={weekendOption} 
                      onValueChange={(value) => setWeekendOption(value as WeekendOption)}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="yes" id="weekend-yes" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="weekend-yes" className="font-medium">
                            Yes: Saturday - Sunday, 6 AM - 6 PM
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Daytime weekend coverage with a dedicated caregiver.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="no" id="weekend-no" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="weekend-no" className="font-medium">
                            No Weekend Coverage
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Skip regular weekend coverage.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Shifts</CardTitle>
                    <CardDescription>
                      Select any additional time slots you need covered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-evening"
                          checked={shifts.weekdayEvening} 
                          onCheckedChange={() => handleShiftChange('weekdayEvening')}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="weekday-evening" className="font-medium">
                            Weekday Evening Shift (4 PM - 12 AM)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Evening care on weekdays after the primary shift ends.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-overnight"
                          checked={shifts.weekdayOvernight} 
                          onCheckedChange={() => handleShiftChange('weekdayOvernight')}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="weekday-overnight" className="font-medium">
                            Weekday Overnight Shift (12 AM - 8 AM)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Overnight care on weekdays for continuous 24-hour coverage.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-evening"
                          checked={shifts.weekendEvening} 
                          onCheckedChange={() => handleShiftChange('weekendEvening')}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="weekend-evening" className="font-medium">
                            Weekend Evening Shift (6 PM - 2 AM)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Evening care on weekends after the primary weekend shift.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-overnight"
                          checked={shifts.weekendOvernight} 
                          onCheckedChange={() => handleShiftChange('weekendOvernight')}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="weekend-overnight" className="font-medium">
                            Weekend Overnight Shift (2 AM - 6 AM)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Overnight care on weekends for complete weekend coverage.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/family/care-management")}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Care Plan"}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default CreateCarePlanPage;
