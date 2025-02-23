
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChefHat, Clock, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipeBrowser from './RecipeBrowser';
import { toast } from "sonner";

interface MealPlannerProps {
  userId: string;
}

const MealPlanner = ({ userId }: MealPlannerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ['meal-plan', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            *,
            recipe:recipes (*)
          )
        `)
        .eq('user_id', userId)
        .eq('start_date', format(selectedDate, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data?.[0];
    },
  });

  const createMealPlanMutation = useMutation({
    mutationFn: async (recipe: any) => {
      if (!selectedDate || !selectedMealType) return;

      // Create or get meal plan
      let mealPlanId = mealPlan?.id;
      
      if (!mealPlanId) {
        const { data: newPlan, error: planError } = await supabase
          .from('meal_plans')
          .insert({
            user_id: userId,
            start_date: format(selectedDate, 'yyyy-MM-dd'),
            end_date: format(selectedDate, 'yyyy-MM-dd'),
            title: `Meal Plan for ${format(selectedDate, 'MMM d, yyyy')}`
          })
          .select()
          .single();

        if (planError) throw planError;
        mealPlanId = newPlan.id;
      }

      // Add meal plan item
      const { error: itemError } = await supabase
        .from('meal_plan_items')
        .insert({
          meal_plan_id: mealPlanId,
          recipe_id: recipe.id,
          meal_type: selectedMealType,
          scheduled_for: format(selectedDate, 'yyyy-MM-dd')
        });

      if (itemError) throw itemError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal added to plan');
    },
    onError: (error) => {
      toast.error('Failed to add meal to plan');
      console.error('Error:', error);
    }
  });

  const mealTypes = [
    { value: 'morning_drink', label: 'Morning Drink' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'morning_snack', label: 'Morning Snack' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'afternoon_snack', label: 'Afternoon Snack' },
    { value: 'dinner', label: 'Dinner' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planner">Meal Planner</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Library</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Meal Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={selectedMealType === type.value ? "default" : "outline"}
                      onClick={() => setSelectedMealType(type.value)}
                      className="w-full"
                      disabled={!selectedDate}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✓ Plan meals for the whole family</p>
                <p className="text-sm">✓ Browse recipe suggestions</p>
                <p className="text-sm">✓ Track nutritional information</p>
                <p className="text-sm">✓ Generate shopping lists</p>
                <p className="text-sm">✓ Share plans with care team</p>
              </CardContent>
            </Card>
          </div>

          {selectedDate && selectedMealType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select a Recipe</h3>
              <RecipeBrowser 
                category={selectedMealType}
                onSelectRecipe={(recipe) => createMealPlanMutation.mutate(recipe)}
              />
            </div>
          )}

          {selectedDate && mealPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Meal Plan for {format(selectedDate, 'MMM d, yyyy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealTypes.map((type) => {
                    const meals = mealPlan.meal_plan_items.filter(
                      (item: any) => item.meal_type === type.value
                    );

                    return (
                      <div key={type.value}>
                        <h4 className="font-medium mb-2">{type.label}</h4>
                        {meals.length > 0 ? (
                          <div className="space-y-2">
                            {meals.map((meal: any) => (
                              <div key={meal.id} className="flex items-center gap-2">
                                <ChefHat className="h-4 w-4" />
                                <span>{meal.recipe.title}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No meals planned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recipes">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Browse our collection of recipes and add them to your meal plan.</p>
              <RecipeBrowser 
                onSelectRecipe={(recipe) => {
                  if (!selectedDate) {
                    toast.error("Please select a date first");
                    return;
                  }
                  createMealPlanMutation.mutate(recipe);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Coming soon: Get personalized meal suggestions based on your preferences and dietary requirements.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlanner;

