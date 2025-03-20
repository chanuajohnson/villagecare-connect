
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

serve(async (req: Request) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Specific user ID to make admin (your ID)
    const userId = "7d850934-a44f-4348-944b-ae7182dca237";
    const userEmail = "chanuajohnson@gmail.com";

    console.log(`Starting to make user ${userId} (${userEmail}) an admin...`);

    // First check if this user exists
    const { data: { users }, error: findError } = await supabase.auth.admin.listUsers({
      filter: {
        id: `eq.${userId}`
      }
    });

    if (findError) {
      console.error("Error finding user:", findError);
      throw findError;
    }

    let user = null;
    if (!users || users.length === 0) {
      // User doesn't exist, create a new admin account
      console.log("User not found, attempting to create admin account");
      
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: "Admin123!", // You would need to change this after login
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }
      
      user = newUser;
      console.log("Created new admin user with id:", user.id);
    } else {
      user = users[0];
      console.log("Found existing user:", user.id);
      
      // Log current metadata to debug
      console.log("Current user metadata:", user.user_metadata);
    }

    // Log the update we're about to do
    console.log(`Updating user ${user.id} to have admin role...`);

    // Update user to have admin role
    const { error: userUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    });

    if (userUpdateError) {
      console.error("Error updating user metadata:", userUpdateError);
      throw userUpdateError;
    }

    console.log("Successfully updated user metadata, now checking profile table...");

    // Check if profile exists
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Error checking profile:", profileCheckError);
      throw profileCheckError;
    }

    console.log("Profile check result:", profile ? "Profile exists" : "No profile found");

    // Update or create profile with admin role
    if (profile) {
      // Log current profile values
      console.log("Current profile values:", profile);
      
      // Update existing profile
      const { data: updatedProfile, error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
        .select();

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        throw profileUpdateError;
      }
      
      console.log("Updated profile:", updatedProfile);
    } else {
      // Create new profile
      const { data: newProfile, error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'admin',
          full_name: 'Admin User'
        })
        .select();

      if (profileCreateError) {
        console.error("Error creating profile:", profileCreateError);
        throw profileCreateError;
      }
      
      console.log("Created new profile:", newProfile);
    }

    // Verify the role was updated correctly - double check
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (verifyError) {
      console.error("Error verifying profile update:", verifyError);
    } else {
      console.log("Verified profile role is now:", verifyProfile.role);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User has been made admin successfully",
        user: {
          id: user.id,
          email: user.email,
          role: 'admin'
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in make-admin function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
