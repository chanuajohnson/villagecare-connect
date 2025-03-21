
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, ClipboardList, CalendarDays } from "lucide-react";

export function CareManagementCard() {
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UsersRound className="h-6 w-6 mr-2 text-blue-600" />
          Care Management
        </CardTitle>
        <CardDescription>
          Coordinate care plans, team members, and scheduling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base flex items-center">
                <ClipboardList className="h-4 w-4 mr-2 text-blue-600" />
                Care Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
              <p className="text-sm text-gray-600">
                Create and manage detailed care plans
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 border-emerald-100">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base flex items-center">
                <UsersRound className="h-4 w-4 mr-2 text-emerald-600" />
                Care Team
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
              <p className="text-sm text-gray-600">
                Authorize and manage caregivers
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-100">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-purple-600" />
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
              <p className="text-sm text-gray-600">
                Coordinate shifts with Google Calendar
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard/family/care-plans")}>
          View Plans
        </Button>
        <Button onClick={() => navigate("/dashboard/family/care-plans")}>
          Manage Care
        </Button>
      </CardFooter>
    </Card>
  );
}
