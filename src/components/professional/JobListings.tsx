
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, ArrowRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const JobListings = () => {
  // This would normally be fetched from a backend API
  const jobs = [
    {
      id: 1,
      title: "Senior Care Provider",
      location: "Boston, MA",
      type: "Full-time",
      salary: "$20-25/hr",
      urgency: "Immediate",
      matchPercentage: 92,
      posted: "2 days ago",
      tags: ["Elderly Care", "Medical Experience"]
    },
    {
      id: 2,
      title: "Special Needs Assistant",
      location: "Cambridge, MA",
      type: "Part-time",
      salary: "$22-28/hr",
      urgency: "This Weekend",
      matchPercentage: 85,
      posted: "3 days ago",
      tags: ["Special Needs", "After School"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full border-l-4 border-l-primary-500 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary-100 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Job Opportunities
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Matched to your profile</p>
            <Button variant="outline" size="sm" className="h-8 gap-1 bg-white/80 hover:bg-white">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.map(job => (
            <div 
              key={job.id} 
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{job.title}</h3>
                <Badge variant="outline" className="bg-primary-100 text-primary-700 border-primary-200">
                  {job.matchPercentage}% Match
                </Badge>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary-500" />
                  <span>{job.type}</span>
                </div>
                <div>
                  <span>{job.salary}</span>
                </div>
                {job.urgency === "Immediate" && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    {job.urgency}
                  </Badge>
                )}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">Posted {job.posted}</p>
                <Link to={`/professional/job/${job.id}`}>
                  <Button variant="ghost" size="sm" className="h-6 p-0 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                    View Details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex justify-between items-center border-primary-200 text-primary-700 hover:bg-primary-50"
          >
            <span>View All Jobs</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
