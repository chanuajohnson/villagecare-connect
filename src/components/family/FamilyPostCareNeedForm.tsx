
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenSquare, ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";

export const FamilyPostCareNeedForm = () => {
  const { user } = useAuth();
  const [careType, setCareType] = useState("");
  const [urgency, setUrgency] = useState("");
  
  const careTypes = [
    "Elder Care",
    "Child Care",
    "Special Needs",
    "Housekeeping",
    "Transportation",
    "Meal Prep",
    "Medication"
  ];
  
  const urgencyTypes = [
    "Immediate",
    "This Week",
    "This Weekend",
    "Next Week",
    "Flexible"
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!careType) {
      toast.error("Please select a care type");
      return;
    }
    
    if (!urgency) {
      toast.error("Please select an urgency level");
      return;
    }
    
    // Here we would normally submit to the backend
    toast.success("Care need posted! Caregivers will be notified.");
    
    // Reset form
    setCareType("");
    setUrgency("");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <PenSquare className="h-5 w-5 text-primary" />
            Post Care Need
          </CardTitle>
          <CardDescription>
            Let caregivers know what kind of help you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Care Needed
              </label>
              <div className="flex flex-wrap gap-2">
                {careTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={careType === type ? "default" : "outline"}
                    className={`cursor-pointer ${
                      careType === type 
                        ? "bg-primary text-white" 
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setCareType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency Level
              </label>
              <div className="flex flex-wrap gap-2">
                {urgencyTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={urgency === type ? "default" : "outline"}
                    className={`cursor-pointer ${
                      urgency === type
                        ? type === "Immediate" 
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : type === "This Week"
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : type === "This Weekend"
                              ? "bg-amber-600 text-white hover:bg-amber-700"
                              : "bg-primary text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setUrgency(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={!user}
              >
                Post Care Need
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              {!user && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You need to log in to post a care need
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
              <Calendar className="h-3 w-3" />
              <span>For recurring care needs, create a <a href="/family/features-overview" className="text-primary hover:underline">care schedule</a> instead</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
