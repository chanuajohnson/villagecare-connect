
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface MealTypeSelectorProps {
  selectedMealType: string;
  setSelectedMealType: (type: string) => void;
  selectedDate: Date | undefined;
}

export const mealTypes = [
  { value: 'morning_drink', label: 'Morning Drink' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'morning_snack', label: 'Morning Snack' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'afternoon_snack', label: 'Afternoon Snack' },
  { value: 'dinner', label: 'Dinner' }
];

const MealTypeSelector = ({ selectedMealType, setSelectedMealType, selectedDate }: MealTypeSelectorProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Meal Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {mealTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedMealType === type.value ? "default" : "outline"}
              onClick={() => setSelectedMealType(type.value)}
              className="w-full text-sm"
              disabled={!selectedDate}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealTypeSelector;

