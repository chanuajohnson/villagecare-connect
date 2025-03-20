
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { TrackableButton } from "@/components/tracking/TrackableButton";

export function TellTheirStoryCard() {
  const { user } = useAuth();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 bg-blue-50">
      <div className="flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        <h3 className="text-xl font-semibold text-blue-800">Tell Their Story</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Share your loved one's story to honor their legacy and help others understand their unique
        personality and needs.
      </p>

      {user ? (
        <TrackableButton 
          asChild 
          className="w-full" 
          variant="default"
          trackingAction="family_story_create_click"
          trackingData={{ source: "family_dashboard" }}
        >
          <Link to="/family/story">Create Their Story</Link>
        </TrackableButton>
      ) : (
        <div className="space-y-2">
          <TrackableButton 
            asChild 
            className="w-full" 
            variant="default"
            trackingAction="auth_signup_from_story_card"
            trackingData={{ source: "family_dashboard" }}
          >
            <Link to="/auth?mode=signup&returnTo=/family/story">Sign Up to Create</Link>
          </TrackableButton>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            Already have an account? <Link to="/auth?returnTo=/family/story" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <Link to="/legacy-stories" className="text-sm text-primary hover:underline">
          View Legacy Stories
        </Link>
      </div>
    </div>
  );
}
