
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Clock, Users, Calendar, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export const MessageBoard = () => {
  // This would normally be fetched from the backend
  const messages = [
    {
      id: 1,
      type: "family",
      author: "Sarah Johnson",
      authorInitial: "SJ",
      title: "Need evening care this weekend",
      timePosted: "2 hours ago",
      urgency: "This Weekend",
      location: "Brookline, MA",
      details: "Looking for 3 hours of evening care for my mother with dementia, Saturday 6-9pm.",
      careNeeds: ["Dementia Care", "Medication Reminder"]
    },
    {
      id: 2,
      type: "professional",
      author: "Michael Rivera",
      authorInitial: "MR",
      title: "Available for same-day assistance",
      timePosted: "Just now",
      urgency: "Today",
      location: "Cambridge, MA",
      details: "Experienced caregiver available today from 2pm-8pm for urgent needs.",
      specialties: ["Senior Care", "Mobility Assistance"]
    },
    {
      id: 3,
      type: "family",
      author: "Sophia Chen",
      authorInitial: "SC",
      title: "Short notice care needed tomorrow",
      timePosted: "Yesterday",
      urgency: "Short Notice",
      location: "Somerville, MA",
      details: "Need assistance with my father recovering from surgery, 4-hour morning shift.",
      careNeeds: ["Post-Surgery Care", "Light Housekeeping"]
    },
    {
      id: 4,
      type: "professional",
      author: "James Wilson",
      authorInitial: "JW",
      title: "Weekend availability",
      timePosted: "3 hours ago",
      urgency: "This Weekend",
      location: "Boston, MA",
      details: "Available all weekend for short or long shifts. Experienced with all levels of care.",
      specialties: ["Special Needs", "Senior Care"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Message Board
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Care needs & availability</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Family</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Professional</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-3 rounded-lg space-y-2 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                  message.type === "family" ? "bg-blue-50 border-l-blue-400" : "bg-green-50 border-l-green-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className={`h-8 w-8 ${message.type === "family" ? "bg-blue-100" : "bg-green-100"}`}>
                      <AvatarFallback className={message.type === "family" ? "text-blue-700" : "text-green-700"}>
                        {message.authorInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{message.title}</h4>
                      <p className="text-xs text-gray-600">{message.author}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={message.urgency === "Today" 
                      ? "bg-red-50 text-red-700" 
                      : message.urgency === "Short Notice" 
                        ? "bg-orange-50 text-orange-700" 
                        : "bg-amber-50 text-amber-700"
                    }
                  >
                    {message.urgency}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600">{message.details}</p>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.type === "family" ? (
                    message.careNeeds.map((need, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white">
                        {need}
                      </Badge>
                    ))
                  ) : (
                    message.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white">
                        {specialty}
                      </Badge>
                    ))
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Posted {message.timePosted}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{message.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link to="/professional/message-board?action=post-need" className="flex-1">
              <Button variant="outline" size="sm" className="w-full flex justify-between items-center">
                <span>Post Care Need</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/professional/message-board?action=post-availability" className="flex-1">
              <Button variant="outline" size="sm" className="w-full flex justify-between items-center">
                <span>Post Availability</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <Link to="/professional/message-board">
            <Button variant="default" size="sm" className="w-full flex justify-between items-center">
              <span>View Full Message Board</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};
