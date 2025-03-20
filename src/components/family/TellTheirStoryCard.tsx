
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { TrackableButton } from "@/components/tracking/TrackableButton";

export function TellTheirStoryCard() {
  const { user } = useAuth();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-2">Tell Their Story</h3>
      <p className="text-sm text-gray-600 mb-4">
        Share your loved one's story to honor their legacy and help others understand their unique
        personality and needs.
      </p>

      {user ? (
        <TrackableButton 
          asChild 
          className="w-full" 
          variant="default"
          actionType="family_story_create_click"
          additionalData={{ source: "family_dashboard" }}
        >
          <Link to="/family/story">Create Their Story</Link>
        </TrackableButton>
      ) : (
        <div className="space-y-2">
          <TrackableButton 
            asChild 
            className="w-full" 
            variant="default"
            actionType="auth_signup_from_story_card"
            additionalData={{ source: "family_dashboard" }}
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
