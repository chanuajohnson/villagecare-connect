
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Clock, Users, Calendar, UserCheck, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_board_posts')
        .select('*')
        .order('time_posted', { ascending: false })
        .limit(4);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log("Fetched messages:", data);
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load message board posts");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      toast.info("Refreshing message board data...");
      
      // Call the edge function to refresh the data
      const { data, error } = await supabase.functions.invoke('update-job-data');
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast.success(`Successfully refreshed data with ${data.postsCount} posts`);
        // Refetch the messages to display the new data
        await fetchMessages();
      } else {
        throw new Error(data.error || "Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh message board data");
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to format time posted
  const formatTimePosted = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    const posted = new Date(timestamp);
    const now = new Date();
    
    // Convert to milliseconds first, then to hours
    const diffInMs = now.getTime() - posted.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Message Board
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Care needs & availability in Trinidad and Tobago</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Family</Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Professional</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg space-y-2 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 ${
                    message.type === "family" ? "bg-gray-50 border-l-primary" : "bg-gray-50 border-l-primary-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className={`h-8 w-8 ${message.type === "family" ? "bg-primary-100" : "bg-primary-200"}`}>
                        <AvatarFallback className={message.type === "family" ? "text-primary-700" : "text-primary-800"}>
                          {message.author_initial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">{message.title}</h4>
                        <p className="text-xs text-gray-600">{message.author}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={message.urgency === "Immediate" 
                        ? "bg-red-50 text-red-700" 
                        : message.urgency === "Short Notice" 
                          ? "bg-orange-50 text-orange-700" 
                          : message.urgency === "This Weekend"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                      }
                    >
                      {message.urgency}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600">{message.details}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {message.type === "family" ? (
                      message.care_needs.map((need, index) => (
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
                      <span>Posted {formatTimePosted(message.time_posted)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{message.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No message board posts found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={refreshData}
                disabled={refreshing}
              >
                Refresh Data
              </Button>
            </div>
          )}
          
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
