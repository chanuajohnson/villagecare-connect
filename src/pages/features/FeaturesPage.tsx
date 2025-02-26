
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FeaturesGrid from "@/components/features/FeaturesGrid";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const FeaturesPage = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <Breadcrumb />
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feature Roadmap
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Help shape the future of Takes a Village by voting for features you'd like to see next.
            Your feedback helps us prioritize what to build.
          </p>
          <div className="flex justify-center gap-4">
            {!session && (
              <Link to="/auth">
                <Button>
                  Sign in to Vote
                </Button>
              </Link>
            )}
          </div>
        </div>

        <FeaturesGrid />
      </div>
    </div>
  );
};

export default FeaturesPage;
