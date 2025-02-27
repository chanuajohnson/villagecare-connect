
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { DashboardRegistrationCard } from "@/components/dashboard/DashboardRegistrationCard";
import { FamilyProfileForm } from "@/components/family/FamilyProfileForm";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("family_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        
        setProfileCompleted(!!data);
      } catch (error) {
        console.error("Error checking profile status:", error);
        setProfileCompleted(false);
      }
    };

    checkProfileStatus();
  }, [user]);

  if (profileCompleted === null) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  const handleShowProfileForm = () => {
    setShowProfileForm(true);
  };

  return (
    <div className="container mx-auto py-10">
      <DashboardHeader 
        title="Family Dashboard" 
        description="Manage your care needs and preferences" 
      />

      {!profileCompleted && !showProfileForm ? (
        <div className="my-6">
          <DashboardRegistrationCard
            title="Complete Your Family Profile"
            description="Please provide some information to help us match you with the right care providers."
            buttonText="Complete Profile"
            onAction={handleShowProfileForm}
          />
        </div>
      ) : showProfileForm ? (
        <div className="my-6">
          <FamilyProfileForm />
        </div>
      ) : (
        <DashboardCardGrid />
      )}
    </div>
  );
}
