
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapDisplay } from '@/components/map/MapDisplay';

export const FamilyMapSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Find Caregivers Near You
          </CardTitle>
          <CardDescription>
            Discover professional caregivers in Trinidad and Tobago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MapDisplay />
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Find caregivers by location, services, or availability.
                </p>
                <Link to="/family/find-caregivers">
                  <Button variant="outline" className="w-full">
                    Search Caregivers
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Browse Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View detailed caregiver profiles and qualifications.
                </p>
                <Link to="/family/caregivers-directory">
                  <Button variant="outline" className="w-full">
                    Browse Directory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <Link to="/family/find-caregivers">
            <Button className="w-full mt-4 flex justify-between items-center">
              <span>View All Caregivers</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};
