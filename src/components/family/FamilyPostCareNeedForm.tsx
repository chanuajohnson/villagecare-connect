
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FamilyPostCareNeedForm = () => {
  const navigate = useNavigate();
  
  const handlePostCareNeed = () => {
    navigate('/subscription-features', { 
      state: { 
        returnPath: '/family/post-care-need',
        featureType: "Posting Care Needs" 
      } 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            Post Care Need
          </CardTitle>
          <p className="text-sm text-gray-600">Share your care requirements with our network</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-2">Find Qualified Care Providers</h3>
            <p className="text-sm text-gray-600 mb-3">
              Describe your care needs and requirements to connect with qualified professionals in your area.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Household care</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Child care</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Elder care</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Medical care</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-2">Specify Your Requirements</h3>
            <p className="text-sm text-gray-600 mb-3">
              Set your preferences for availability, skills, certifications, and experience.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Schedule needs</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Experience level</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Special skills</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
                <span>Budget range</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="default" 
            size="lg" 
            className="w-full flex justify-between items-center"
            onClick={handlePostCareNeed}
          >
            <span>Post Care Need</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
