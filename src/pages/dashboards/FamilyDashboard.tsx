import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { DashboardRegistrationCard } from "@/components/dashboard/DashboardRegistrationCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarRange, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapDisplay from "@/components/map/MapDisplay";

export default function FamilyDashboard() {
  const { userRole, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  if (!isProfileComplete) {
    return (
      <div className="container py-8">
        <DashboardHeader
          title="Family Dashboard"
          description="Welcome to your family caregiver dashboard"
        />
        <DashboardRegistrationCard
          title="Complete Your Profile"
          description="To get the most out of Takes a Village, please complete your profile with information about your caregiving needs."
          linkText="Complete Registration"
          linkHref="/registration/family"
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <DashboardHeader
        title="Family Dashboard"
        description="Manage your care needs and find support in your community"
      />

      <Tabs defaultValue="overview" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
          <TabsTrigger value="professionals">Professionals</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DashboardCardGrid>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Care Schedule</CardTitle>
                  <CardDescription>Upcoming care sessions</CardDescription>
                </div>
                <CalendarRange className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No upcoming sessions</AlertTitle>
                  <AlertDescription>
                    You don't have any care sessions scheduled.
                  </AlertDescription>
                </Alert>
                <Button>Schedule Care</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Care Team</CardTitle>
                  <CardDescription>Your current caregivers</CardDescription>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You don't have any caregivers in your team yet.
                  </p>
                  <Button onClick={() => navigate("/professional/features-overview")}>
                    Find Caregivers
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Tips & Resources</CardTitle>
                  <CardDescription>Helpful information for families</CardDescription>
                </div>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert variant="default">
                    <AlertTitle>New Resource Available</AlertTitle>
                    <AlertDescription>
                      We've published a new guide on managing medication schedules.
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/family/features-overview")}>
                        Read more
                      </Button>
                    </AlertDescription>
                  </Alert>
                  <Alert variant="default">
                    <AlertTitle>Community Event</AlertTitle>
                    <AlertDescription>
                      Join our virtual support group for families this Saturday at 10AM.
                      <Button variant="link" className="p-0 h-auto">
                        Register now
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </DashboardCardGrid>
          
          {/* Map Display */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Find Professional Caregivers</h2>
            <MapDisplay className="w-full" />
          </div>
        </TabsContent>

        <TabsContent value="care-plans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Plans</CardTitle>
              <CardDescription>
                Create and manage detailed care plans for your loved ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Care Plans Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first care plan to organize care tasks, medication schedules, and important information for caregivers.
                </p>
                <Button>Create a Care Plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professionals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Caregivers</CardTitle>
              <CardDescription>
                Find and connect with qualified caregivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapDisplay className="w-full" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communicate with your care team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Messages</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Once you've connected with caregivers, you'll be able to message them directly from here.
                </p>
                <Button onClick={() => navigate("/professional/features-overview")}>
                  Find Caregivers
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
