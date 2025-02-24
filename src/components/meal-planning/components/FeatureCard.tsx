
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const FeatureCard = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Plan meals for the whole family
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Browse recipe suggestions
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Track nutritional information
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Generate shopping lists
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span>
            Share plans with care team
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

