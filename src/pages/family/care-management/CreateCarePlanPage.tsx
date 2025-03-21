
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { createCarePlan } from "@/services/care-plan-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const planTypeOptions = [
  { id: "scheduled", label: "Scheduled Care Plan" },
  { id: "ondemand", label: "On-Demand Care Plan" },
  { id: "both", label: "Both Scheduled and On-Demand" },
];

const primaryWeekdayOptions = [
  { id: "option1", label: "Option 1: Monday-Friday (8 AM - 4 PM)" },
  { id: "option2", label: "Option 2: Monday-Friday (6 AM - 6 PM)" },
  { id: "none", label: "No Primary Weekday Coverage" },
];

const primaryWeekendOptions = [
  { id: "yes", label: "Yes: Saturday-Sunday (6 AM - 6 PM)" },
  { id: "no", label: "No Primary Weekend Coverage" },
];

const additionalShiftOptions = [
  { id: "weekday_evening", label: "Weekday Evening (4 PM - 12 AM)" },
  { id: "weekday_overnight", label: "Weekday Overnight (12 AM - 8 AM)" },
  { id: "weekend_evening", label: "Weekend Evening (6 PM - 2 AM)" },
  { id: "weekend_overnight", label: "Weekend Overnight (2 AM - 6 AM)" },
];

const formSchema = z.object({
  title: z.string().min(3, { message: "Plan title must be at least 3 characters" }),
  description: z.string().optional(),
  planType: z.enum(["scheduled", "ondemand", "both"]),
  primaryWeekday: z.enum(["option1", "option2", "none"]),
  primaryWeekend: z.enum(["yes", "no"]),
  additionalShifts: z.array(z.string()).optional(),
});

const CreateCarePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      planType: "scheduled",
      primaryWeekday: "option1",
      primaryWeekend: "yes",
      additionalShifts: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create a care plan");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for the API
      const careplan = {
        title: data.title,
        description: data.description || "",
        family_id: user.id,
        status: "active",
        // We could store additional metadata here if needed
        // metadata: JSON.stringify({
        //   planType: data.planType,
        //   primaryWeekday: data.primaryWeekday,
        //   primaryWeekend: data.primaryWeekend,
        //   additionalShifts: data.additionalShifts,
        // }),
      };

      const result = await createCarePlan(careplan);
      
      if (result) {
        toast.success("Care plan created successfully");
        navigate(`/family/care-management/${result.id}`);
      } else {
        throw new Error("Failed to create care plan");
      }
    } catch (error) {
      console.error("Error creating care plan:", error);
      toast.error("Failed to create care plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="family_care_plan_create" 
        additionalData={{ section: "care_management" }}
      />
      
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/family/care-management")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Care Management
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Create New Care Plan</h1>
            <p className="text-muted-foreground mt-1">
              Define a care plan and schedule for your loved one
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>
                  Basic information about the care plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mom's Weekly Care Plan" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your plan a descriptive name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of this care plan" {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional details about the care plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Type</CardTitle>
                <CardDescription>
                  Choose the type of care plan you want to create
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {planTypeOptions.map((option) => (
                            <FormItem key={option.id} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={option.id} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Primary Coverage</CardTitle>
                <CardDescription>
                  Set up the main recurring shifts for your care plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Weekday Primary Caregiver</h3>
                  <FormField
                    control={form.control}
                    name="primaryWeekday"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {primaryWeekdayOptions.map((option) => (
                              <FormItem key={option.id} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option.id} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Weekend Primary Caregiver</h3>
                  <FormField
                    control={form.control}
                    name="primaryWeekend"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {primaryWeekendOptions.map((option) => (
                              <FormItem key={option.id} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option.id} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Shifts</CardTitle>
                <CardDescription>
                  Fill in any uncovered time slots with additional caregivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="additionalShifts"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Select any additional shifts you want to include:</FormLabel>
                        <FormDescription>
                          These shifts will be available for caregivers to claim or for you to assign
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          {additionalShiftOptions.map((item) => (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValues, item.id])
                                      : field.onChange(
                                          currentValues.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/family/care-management")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                    Creating...
                  </span>
                ) : (
                  <>Create Care Plan</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Container>
    </div>
  );
};

export default CreateCarePlanPage;
