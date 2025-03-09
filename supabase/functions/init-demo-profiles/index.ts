
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create sample profiles
    const professionalProfiles = [
      {
        id: crypto.randomUUID(),
        role: "professional",
        full_name: "Sarah Johnson",
        professional_type: "Registered Nurse",
        address: "Port of Spain, Trinidad",
        years_of_experience: "5+ years",
        bio: "Dedicated registered nurse with over 5 years of experience specializing in elder care and chronic disease management. I'm passionate about providing compassionate, personalized care.",
        care_services: ["Elder Care", "Medication Management", "Wound Care", "Vital Signs Monitoring"],
        certifications: ["Registered Nurse (RN)", "CPR Certified", "First Aid"],
        license_number: "TT-RN-12345",
        languages: ["English", "Spanish"],
        expected_rate: "$25-30/hour",
        availability: ["Weekdays", "Evenings"],
        background_check: true
      },
      {
        id: crypto.randomUUID(),
        role: "professional",
        full_name: "Michael Thomas",
        professional_type: "Home Health Aide",
        address: "San Fernando, Trinidad",
        years_of_experience: "3+ years",
        bio: "Compassionate home health aide dedicated to improving quality of life through personalized care. Specialized in mobility assistance and daily living support.",
        care_services: ["Personal Care", "Mobility Assistance", "Meal Preparation", "Companionship"],
        certifications: ["Certified Nursing Assistant (CNA)", "CPR Certified"],
        languages: ["English"],
        expected_rate: "$15-20/hour",
        availability: ["Weekdays", "Weekends", "Overnight"],
        background_check: true
      },
      {
        id: crypto.randomUUID(),
        role: "professional",
        full_name: "Lisa Ramcharran",
        professional_type: "Physical Therapist",
        address: "Arima, Trinidad",
        years_of_experience: "7+ years",
        bio: "Licensed physical therapist specializing in rehabilitation, pain management, and mobility improvement. I create personalized therapy plans to help clients regain independence.",
        care_services: ["Rehabilitation", "Pain Management", "Strength Training", "Mobility Exercises"],
        certifications: ["Licensed Physical Therapist", "Geriatric Specialist"],
        license_number: "TT-PT-7890",
        languages: ["English", "Hindi"],
        expected_rate: "$35-45/hour",
        availability: ["Weekdays", "Saturday Mornings"],
        background_check: true
      },
      {
        id: crypto.randomUUID(),
        role: "professional",
        full_name: "David Cooper",
        professional_type: "Care Companion",
        address: "Chaguanas, Trinidad",
        years_of_experience: "2+ years",
        bio: "Friendly and attentive care companion offering companionship and basic assistance. I enjoy engaging in meaningful conversations and activities with clients.",
        care_services: ["Companionship", "Light Housekeeping", "Errands", "Meal Preparation"],
        certifications: ["First Aid Certified"],
        languages: ["English"],
        expected_rate: "$12-15/hour",
        availability: ["Flexible", "Evenings", "Weekends"],
        background_check: true
      },
      {
        id: crypto.randomUUID(),
        role: "professional",
        full_name: "James Ali",
        professional_type: "Occupational Therapist",
        address: "Scarborough, Tobago",
        years_of_experience: "6+ years",
        bio: "Dedicated occupational therapist helping clients regain independence in daily activities. Specialized in adaptive equipment and home modifications.",
        care_services: ["ADL Training", "Home Safety Assessment", "Cognitive Exercises", "Fine Motor Skills"],
        certifications: ["Licensed Occupational Therapist", "Home Modification Specialist"],
        license_number: "TT-OT-5678",
        languages: ["English"],
        expected_rate: "$30-40/hour",
        availability: ["Weekdays", "Some Weekends"],
        background_check: true
      }
    ]

    // Insert the demo profiles
    const { data, error } = await supabase.from('profiles').upsert(professionalProfiles)
    
    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Demo profiles created successfully",
        count: professionalProfiles.length
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error:", error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    )
  }
})
