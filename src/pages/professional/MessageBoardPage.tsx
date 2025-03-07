
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Calendar, 
  MapPin, 
  Plus, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const MessageBoardPage = () => {
  const { user } = useAuth();
  const [messageType, setMessageType] = useState<"all" | "family" | "professional">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postType, setPostType] = useState<"need" | "availability">("need");
  
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
      details: "Looking for 3 hours of evening care for my mother with dementia, Saturday 6-9pm. She needs medication reminders and light meal preparation. Calm, patient caregiver preferred.",
      careNeeds: ["Dementia Care", "Medication Reminder", "Meal Preparation"]
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
      details: "Experienced caregiver available today from 2pm-8pm for urgent needs. 5+ years of experience with seniors and special needs care. Can provide transportation, meal prep, and medication management.",
      specialties: ["Senior Care", "Mobility Assistance", "Transportation"]
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
      details: "Need assistance with my father recovering from surgery, 4-hour morning shift. Help with mobility, light housekeeping, and preparing breakfast/lunch. Experience with post-surgery care preferred.",
      careNeeds: ["Post-Surgery Care", "Light Housekeeping", "Meal Preparation"]
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
      details: "Available all weekend for short or long shifts. Experienced with all levels of care including dementia, mobility assistance, and special needs. Can provide references and background check.",
      specialties: ["Special Needs", "Senior Care", "Dementia Care"]
    },
    {
      id: 5,
      type: "family",
      author: "David Thompson",
      authorInitial: "DT",
      title: "Urgent care needed for elderly parent",
      timePosted: "1 hour ago",
      urgency: "Today",
      location: "Newton, MA",
      details: "My mother fell ill suddenly and I need someone to stay with her today while I'm at work. Need someone experienced with elderly care and medication management. From 11am-6pm today.",
      careNeeds: ["Elderly Care", "Medication Management", "Companion Care"]
    },
    {
      id: 6,
      type: "professional",
      author: "Emily Rodriguez",
      authorInitial: "ER",
      title: "Overnight care available next week",
      timePosted: "5 hours ago",
      urgency: "Regular",
      location: "Medford, MA",
      details: "Licensed nurse available for overnight shifts Monday-Thursday next week. Specialized in post-hospital care, wound management, and medication administration. References available.",
      specialties: ["Nursing Care", "Overnight Care", "Post-Hospital Care"]
    }
  ];
  
  const breadcrumbItems = [
    { label: "Professional", href: "/dashboard/professional" },
    { label: "Message Board", href: "/professional/message-board" },
  ];
  
  const filteredMessages = messages.filter(message => {
    // Apply type filter
    if (messageType !== "all" && message.type !== messageType) return false;
    
    // Apply urgency filter
    if (urgencyFilter !== "all" && message.urgency !== urgencyFilter) return false;
    
    // Apply search query
    if (searchQuery && !message.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  const renderFilterBadge = (label: string, value: string, currentValue: string, setter: (value: string) => void) => (
    <Badge 
      variant={currentValue === value ? "default" : "outline"} 
      className={`cursor-pointer ${currentValue === value ? "bg-primary" : "hover:bg-primary/10"}`}
      onClick={() => setter(value)}
    >
      {label}
    </Badge>
  );
  
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to the backend
    setShowPostForm(false);
    // Display success message
    alert(`Successfully posted ${postType === "need" ? "care need" : "availability"}`);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Message Board</h1>
            <div className="flex gap-2">
              <Button 
                onClick={() => { setShowPostForm(true); setPostType("need"); }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Post Care Need
              </Button>
              <Button 
                onClick={() => { setShowPostForm(true); setPostType("availability"); }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Post Availability
              </Button>
            </div>
          </div>
          
          {showPostForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {postType === "need" ? "Post a Care Need" : "Post Your Availability"}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPostForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {postType === "need" 
                    ? "Share your care requirements to find suitable care providers"
                    : "Let families know when you're available to provide care"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                    <Input id="title" placeholder="Enter a clear, descriptive title" required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                      <Input id="location" placeholder="City, neighborhood, etc." required />
                    </div>
                    
                    <div>
                      <label htmlFor="urgency" className="block text-sm font-medium mb-1">Urgency/Timing</label>
                      <select 
                        id="urgency" 
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        defaultValue="Regular"
                        required
                      >
                        <option value="Today">Today (Urgent)</option>
                        <option value="Short Notice">Short Notice (Within 48 hours)</option>
                        <option value="This Weekend">This Weekend</option>
                        <option value="Regular">Regular (Planned in advance)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium mb-1">Details</label>
                    <Textarea 
                      id="details" 
                      placeholder={postType === "need" 
                        ? "Describe care needs, schedule, requirements, etc." 
                        : "Describe your experience, availability, services offered, etc."
                      } 
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  
                  {postType === "need" ? (
                    <div>
                      <label className="block text-sm font-medium mb-1">Care Needs (select all that apply)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["Medication Management", "Meal Preparation", "Personal Care", "Transportation", "Mobility Assistance", "Companion Care"].map((need) => (
                          <div key={need} className="flex items-center">
                            <input type="checkbox" id={need} className="mr-2" />
                            <label htmlFor={need} className="text-sm">{need}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-1">Specialties (select all that apply)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["Senior Care", "Special Needs", "Dementia Care", "Post-Surgery", "Respite Care", "Overnight Care"].map((specialty) => (
                          <div key={specialty} className="flex items-center">
                            <input type="checkbox" id={specialty} className="mr-2" />
                            <label htmlFor={specialty} className="text-sm">{specialty}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      {postType === "need" ? "Post Care Need" : "Post Availability"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          placeholder="Search by keyword, location, or care type..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium mr-1">Filter:</span>
                      <div className="flex flex-wrap gap-2">
                        {renderFilterBadge("All Types", "all", messageType, setMessageType)}
                        {renderFilterBadge("Family", "family", messageType, setMessageType)}
                        {renderFilterBadge("Professional", "professional", messageType, setMessageType)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-sm font-medium mr-2">Urgency:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {renderFilterBadge("All", "all", urgencyFilter, setUrgencyFilter)}
                      {renderFilterBadge("Today", "Today", urgencyFilter, setUrgencyFilter)}
                      {renderFilterBadge("Short Notice", "Short Notice", urgencyFilter, setUrgencyFilter)}
                      {renderFilterBadge("This Weekend", "This Weekend", urgencyFilter, setUrgencyFilter)}
                      {renderFilterBadge("Regular", "Regular", urgencyFilter, setUrgencyFilter)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {messageType === "family" ? "Family Care Needs" : messageType === "professional" ? "Professional Availability" : "All Messages"}
                  <Badge className="ml-2">{filteredMessages.length}</Badge>
                </h2>
                
                {filteredMessages.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium text-gray-500">No messages found</h3>
                      <p className="text-gray-400 mt-2">Try adjusting your filters or search query</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMessages.map((message) => (
                    <Card 
                      key={message.id} 
                      className={`hover:shadow-md transition-shadow ${
                        message.type === "family" ? "border-l-4 border-l-blue-400" : "border-l-4 border-l-green-400"
                      }`}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Avatar className={message.type === "family" ? "bg-blue-100" : "bg-green-100"}>
                                <AvatarFallback className={message.type === "family" ? "text-blue-700" : "text-green-700"}>
                                  {message.authorInitial}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <h3 className="font-medium text-lg">{message.title}</h3>
                                <p className="text-sm text-gray-500">{message.author}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-gray-700">{message.details}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                              {message.type === "family" ? (
                                message.careNeeds.map((need, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                                    {need}
                                  </Badge>
                                ))
                              ) : (
                                message.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                                    {specialty}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                            <Badge 
                              className={`${
                                message.urgency === "Today" 
                                  ? "bg-red-100 text-red-700" 
                                  : message.urgency === "Short Notice" 
                                    ? "bg-orange-100 text-orange-700" 
                                    : message.urgency === "This Weekend"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {message.urgency}
                            </Badge>
                            
                            <div className="flex flex-col gap-2 text-xs text-gray-500 items-end">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Posted {message.timePosted}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{message.location}</span>
                              </div>
                            </div>
                            
                            <Button variant="outline" size="sm" className="mt-2">
                              {message.type === "family" ? "Offer Help" : "Request Service"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MessageBoardPage;
