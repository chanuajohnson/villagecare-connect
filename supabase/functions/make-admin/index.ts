
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

    // First check if this user exists
    const { data: { users }, error: findError } = await supabase.auth.admin.listUsers({
      filter: {
        id: `eq.${userId}`
      }
    });

    if (findError) {
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
        throw createError;
      }
      
      user = newUser;
      console.log("Created new admin user with id:", user.id);
    } else {
      user = users[0];
      console.log("Found existing user:", user.id);
    }

    // Update user to have admin role
    const { error: userUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    });

    if (userUpdateError) {
      throw userUpdateError;
    }

    // Check if profile exists
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) {
      throw profileCheckError;
    }

    if (profile) {
      // Update existing profile
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }
    } else {
      // Create new profile
      const { error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'admin',
          full_name: 'Admin User'
        });

      if (profileCreateError) {
        throw profileCreateError;
      }
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
