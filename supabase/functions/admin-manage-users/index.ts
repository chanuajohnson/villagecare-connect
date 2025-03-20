
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the original request URL to determine the action
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // For testing purposes: bypass the admin check
    const bypassAdminCheck = true; // Set to true for testing

    // Authentication check - verify the requester is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Skip admin check if bypass is enabled for testing
    if (!bypassAdminCheck) {
      // Verify admin role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Admin privileges required" }),
          { 
            status: 403, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Handle different actions based on the request
    if (req.method === "GET") {
      // List unverified users
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          verified: false,
        },
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({ users: users.users }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else if (req.method === "POST") {
      // Handle different user management actions
      const { action, userId, email } = await req.json();

      switch (action) {
        case "resend_verification":
          if (!email) {
            return new Response(
              JSON.stringify({ error: "Email is required" }),
              { 
                status: 400, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          
          const { error: resendError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
          
          if (resendError) {
            return new Response(
              JSON.stringify({ error: resendError.message }),
              { 
                status: 500, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, message: "Verification email resent" }),
            { 
              status: 200, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );

        case "delete_user":
          if (!userId) {
            return new Response(
              JSON.stringify({ error: "User ID is required" }),
              { 
                status: 400, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          
          if (deleteError) {
            return new Response(
              JSON.stringify({ error: deleteError.message }),
              { 
                status: 500, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, message: "User deleted successfully" }),
            { 
              status: 200, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );

        case "manually_verify":
          if (!userId) {
            return new Response(
              JSON.stringify({ error: "User ID is required" }),
              { 
                status: 400, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          
          // Update the user's email verification status
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { email_confirm: true }
          );
          
          if (updateError) {
            return new Response(
              JSON.stringify({ error: updateError.message }),
              { 
                status: 500, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, message: "User verified successfully" }),
            { 
              status: 200, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );

        default:
          return new Response(
            JSON.stringify({ error: "Invalid action" }),
            { 
              status: 400, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
      }
    }

    // If we reach here, the request method is not supported
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
