
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

    // Parse request body
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing action parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing action: ${action}`);

    // Handle action specific logic
    switch (action) {
      case "get_unverified_users": {
        // Get users who haven't confirmed their email
        const { data: { users }, error } = await supabase.auth.admin.listUsers({
          filter: {
            confirmed_at: "is.null"
          }
        });

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ users }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resend_verification": {
        const { email } = body;
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email parameter is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Check if the user exists
        const { data: { users }, error: findError } = await supabase.auth.admin.listUsers({
          filter: {
            email: `eq.${email}`
          }
        });

        if (findError) {
          throw findError;
        }

        if (!users || users.length === 0) {
          return new Response(
            JSON.stringify({ error: "User not found" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }

        const user = users[0];

        // Check if the user is already confirmed
        if (user.email_confirmed_at) {
          return new Response(
            JSON.stringify({ error: "Email is already verified" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Generate a new confirmation link and send it
        const { error } = await supabase.auth.admin.generateLink({
          type: "signup",
          email: email,
        });

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "manually_verify": {
        const { userId } = body;
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "User ID parameter is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Update user's verification status
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          email_confirm: true
        });

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_user": {
        const { userId } = body;
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "User ID parameter is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Delete the user
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "set_admin_role": {
        const { userId } = body;
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "User ID parameter is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        console.log(`Attempting to set admin role for user ${userId}`);

        // First update the user's metadata
        const { data: metadataUpdate, error: userUpdateError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { role: 'admin' }
        });

        if (userUpdateError) {
          console.error("Error updating user metadata:", userUpdateError);
          throw userUpdateError;
        }

        console.log("User metadata updated successfully:", metadataUpdate);

        // Then update the profile in the profiles table
        const { data: profileUpdate, error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
          .select();

        if (profileUpdateError) {
          console.error("Error updating profile role:", profileUpdateError);
          throw profileUpdateError;
        }

        console.log("Profile updated successfully:", profileUpdate);

        // Verify the update was successful
        const { data: verifyProfile, error: verifyError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (verifyError) {
          console.error("Error verifying profile update:", verifyError);
        } else {
          console.log("Verified profile role is now:", verifyProfile.role);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin-manage-users function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
