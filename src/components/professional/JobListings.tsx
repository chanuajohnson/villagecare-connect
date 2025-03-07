
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Clock, MapPin, DollarSign, Filter, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const JobListings = () => {
  // This would normally be fetched from the backend
  const jobs = [
    {
      id: 1,
      title: "Senior Care Provider",
      location: "Boston, MA",
      type: "Full-time",
      postedAt: "2 days ago",
      salary: "$20-25/hr",
      match: 92,
      urgency: "Regular",
      startDate: "Immediate",
      tags: ["Elderly Care", "Medical Experience"]
    },
    {
      id: 2,
      title: "Special Needs Assistant",
      location: "Cambridge, MA",
      type: "Part-time",
      postedAt: "1 day ago",
      salary: "$22-28/hr",
      match: 85,
      urgency: "Short Notice",
      startDate: "This Weekend",
      tags: ["Special Needs", "After School"]
    },
    {
      id: 3,
      title: "Home Health Aide",
      location: "Somerville, MA",
      type: "Short-term",
      postedAt: "Just now",
      salary: "$18-22/hr",
      match: 78,
      urgency: "Urgent",
      startDate: "Today",
      tags: ["Medical Care", "Weekends"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5 text-green-500" />
            Job Opportunities
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Matched to your profile</p>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className={`p-3 rounded-lg space-y-2 hover:bg-gray-100 transition-colors cursor-pointer ${
                job.urgency === "Urgent" 
                  ? "bg-red-50 border-l-4 border-l-red-400" 
                  : job.urgency === "Short Notice"
                    ? "bg-amber-50 border-l-4 border-l-amber-400"
                    : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800">{job.title}</h3>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  {job.match}% Match
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{job.startDate}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <p className="text-xs text-gray-400">Posted {job.postedAt}</p>
                <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:text-green-800">
                  View Details
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <Link to="/professional/job-listings">
            <Button variant="outline" size="sm" className="w-full flex justify-between items-center">
              <span>Browse All Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};
