
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export const MessageBoard = () => {
  // Current page path and label to pass as referrer info
  const currentPage = {
    path: "/professional/message-board",
    label: "Message Board"
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Message Board</CardTitle>
        <CardDescription>
          Connect with families and other caregivers in your community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-lg font-medium mb-2">Premium Feature Coming Soon</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our message board will allow caregivers to connect with families, discuss care techniques, and build a professional network.
          </p>
          
          <Link 
            to="/subscription/features" 
            state={{ 
              featureType: "Premium Message Board", 
              returnPath: "/professional/message-board",
              referringPagePath: currentPage.path,
              referringPageLabel: currentPage.label
            }}
          >
            <Button className="w-full md:w-auto">
              Learn about Premium Features
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
