
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || "";
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
const PAYPAL_API_URL = Deno.env.get("PAYPAL_API_URL") || "https://api-m.paypal.com"; // Use sandbox for testing: https://api-m.sandbox.paypal.com

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { subscription_id } = await req.json();
    console.log("Completing subscription:", subscription_id);

    if (!subscription_id) {
      return new Response(
        JSON.stringify({ error: "Missing subscription_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token from PayPal
    const accessToken = await getPayPalAccessToken();

    // Get the subscription details from our database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error("Subscription not found:", subscriptionError);
      return new Response(
        JSON.stringify({ error: "Subscription not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the subscription status with PayPal
    const paypalSubscription = await getPayPalSubscriptionDetails(
      accessToken,
      subscriptionData.paypal_subscription_id
    );

    // Update our database record with the latest status
    await supabase
      .from("user_subscriptions")
      .update({
        status: mapPayPalStatusToOurStatus(paypalSubscription.status),
        updated_at: new Date().toISOString(),
        // Add additional fields from PayPal response if needed
      })
      .eq("id", subscription_id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscriptionData.id,
          status: mapPayPalStatusToOurStatus(paypalSubscription.status),
          plan_id: subscriptionData.plan_id,
          paypal_status: paypalSubscription.status,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error completing subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getPayPalAccessToken() {
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en_US",
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal authentication error:", error);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

async function getPayPalSubscriptionDetails(accessToken, subscriptionId) {
  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal subscription details error:", error);
    throw new Error("Failed to get subscription details from PayPal");
  }

  return await response.json();
}

function mapPayPalStatusToOurStatus(paypalStatus) {
  const statusMap = {
    "APPROVAL_PENDING": "pending",
    "APPROVED": "active",
    "ACTIVE": "active",
    "SUSPENDED": "suspended",
    "CANCELLED": "cancelled",
    "EXPIRED": "expired",
  };
  
  return statusMap[paypalStatus] || "pending";
}
