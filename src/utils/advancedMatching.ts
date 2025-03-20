
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type CareRecipientProfile = {
  id: string;
  user_id: string;
  full_name: string;
  birth_year: string;
  personality_traits: string[];
  hobbies_interests: string[];
  notable_events: string | null;
  career_fields: string[];
  family_social_info: string | null;
  caregiver_personality: string[];
  cultural_preferences: string | null;
  daily_routines: string | null;
  challenges: string[];
  sensitivities: string | null;
  specific_requests: string | null;
  life_story: string | null;
  joyful_things: string | null;
  unique_facts: string | null;
  last_updated: string;
  created_at: string;
};

export type FamilyProfile = Tables<"profiles"> & {
  care_recipient?: CareRecipientProfile;
};

export type ProfessionalProfile = Tables<"profiles">;

export type MatchResult = {
  professionalId: string;
  familyId: string;
  matchScore: number;
  matchDetails: {
    careTypesMatch: number;
    specialNeedsMatch: number;
    personalityMatch: number;
    interestsMatch: number;
    experienceMatch: number;
    culturalMatch: number;
    locationMatch: number;
    availability: number;
  };
};

// Function to fetch a care recipient profile
export async function fetchCareRecipientProfile(userId: string): Promise<CareRecipientProfile | null> {
  const { data, error } = await supabase
    .from('care_recipient_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching care recipient profile:', error);
    return null;
  }
  
  return data as CareRecipientProfile;
}

// Calculate match score between a family and professional
export async function calculateAdvancedMatchScore(
  familyProfile: FamilyProfile,
  professionalProfile: ProfessionalProfile
): Promise<MatchResult> {
  // Get care recipient profile if not already included
  let careRecipientProfile = familyProfile.care_recipient;
  if (!careRecipientProfile) {
    careRecipientProfile = await fetchCareRecipientProfile(familyProfile.id);
  }
  
  // Initialize match details with 0 scores
  const matchDetails = {
    careTypesMatch: 0,
    specialNeedsMatch: 0,
    personalityMatch: 0,
    interestsMatch: 0,
    experienceMatch: 0,
    culturalMatch: 0,
    locationMatch: 0,
    availability: 0,
  };
  
  // 1. Basic matching (existing functionality)
  // Care types matching (25%)
  if (familyProfile.care_types && professionalProfile.caregiving_areas) {
    const familyCareTypes = familyProfile.care_types;
    const professionalCareAreas = professionalProfile.caregiving_areas;
    
    if (familyCareTypes.length > 0 && professionalCareAreas && professionalCareAreas.length > 0) {
      const matchingCareTypes = familyCareTypes.filter(type => 
        professionalCareAreas.includes(type)
      );
      matchDetails.careTypesMatch = Math.min(matchingCareTypes.length / familyCareTypes.length, 1) * 25;
    }
  }
  
  // Special needs matching (15%)
  if (familyProfile.special_needs && professionalProfile.medical_conditions_experience) {
    const familySpecialNeeds = familyProfile.special_needs;
    const professionalExperience = professionalProfile.medical_conditions_experience;
    
    if (familySpecialNeeds.length > 0 && professionalExperience && professionalExperience.length > 0) {
      const matchingNeeds = familySpecialNeeds.filter(need => 
        professionalExperience.includes(need)
      );
      matchDetails.specialNeedsMatch = Math.min(matchingNeeds.length / familySpecialNeeds.length, 1) * 15;
    }
  }
  
  // Location proximity (10%)
  // This is a simplified version. In a real implementation, you'd use geolocation
  if (familyProfile.location === professionalProfile.location) {
    matchDetails.locationMatch = 10;
  }
  
  // Availability matching (10%)
  if (familyProfile.care_schedule && professionalProfile.availability) {
    // For simplicity, we're just checking if the caregiver mentions availability
    // In a real implementation, you'd parse and compare schedule details
    if (professionalProfile.availability.length > 0) {
      matchDetails.availability = 10;
    }
  }
  
  // 2. Advanced matching using care recipient profile (40% total)
  if (careRecipientProfile) {
    // Personality matching (15%)
    if (careRecipientProfile.caregiver_personality && careRecipientProfile.caregiver_personality.length > 0) {
      // For now, we'll just give a 50% match for having any personality requirements
      // In a real implementation, you'd compare with professional's personality traits
      matchDetails.personalityMatch = 7.5;
      
      // Additional match if professional has a bio
      if (professionalProfile.bio) {
        matchDetails.personalityMatch += 7.5;
      }
    }
    
    // Interests and hobbies matching (10%)
    if (careRecipientProfile.hobbies_interests && careRecipientProfile.hobbies_interests.length > 0) {
      // For simplicity, we'll just check if the professional has experience
      // In a real implementation, you would do more sophisticated matching
      if (professionalProfile.years_of_experience) {
        matchDetails.interestsMatch = 10;
      }
    }
    
    // Cultural preferences matching (10%)
    if (careRecipientProfile.cultural_preferences) {
      // For simplicity, we'll check if the professional has languages
      if (professionalProfile.languages && professionalProfile.languages.length > 0) {
        matchDetails.culturalMatch = 10;
      }
    }
    
    // Medical experience matching for specific challenges (5%)
    if (careRecipientProfile.challenges && careRecipientProfile.challenges.length > 0 && 
        professionalProfile.medical_conditions_experience) {
      const medicalChallenges = careRecipientProfile.challenges.filter(
        challenge => professionalProfile.medical_conditions_experience?.includes(challenge)
      );
      
      if (medicalChallenges.length > 0) {
        matchDetails.experienceMatch = 5;
      }
    }
  }
  
  // Calculate total match score
  const totalScore = Object.values(matchDetails).reduce((sum, score) => sum + score, 0);
  
  return {
    professionalId: professionalProfile.id,
    familyId: familyProfile.id,
    matchScore: totalScore,
    matchDetails,
  };
}

// Function to get matches for a family
export async function getFamilyMatches(
  familyId: string, 
  limit: number = 10
): Promise<Array<ProfessionalProfile & { matchScore: number; matchDetails: any }>> {
  try {
    // Fetch the family profile
    const { data: familyData, error: familyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', familyId)
      .eq('role', 'family')
      .single();
    
    if (familyError || !familyData) {
      console.error('Error fetching family profile:', familyError);
      return [];
    }
    
    // Fetch the care recipient profile
    const careRecipientProfile = await fetchCareRecipientProfile(familyId);
    const familyProfile: FamilyProfile = {
      ...familyData,
      care_recipient: careRecipientProfile || undefined
    };
    
    // Fetch all professional profiles
    const { data: professionals, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professional');
    
    if (profError || !professionals) {
      console.error('Error fetching professional profiles:', profError);
      return [];
    }
    
    // Calculate match scores for each professional
    const matchPromises = professionals.map(async (prof) => {
      const matchResult = await calculateAdvancedMatchScore(familyProfile, prof);
      return {
        ...prof,
        matchScore: matchResult.matchScore,
        matchDetails: matchResult.matchDetails
      };
    });
    
    const matches = await Promise.all(matchPromises);
    
    // Sort by match score and take the top ones
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error in getFamilyMatches:', error);
    return [];
  }
}

// Function to get matches for a professional
export async function getProfessionalMatches(
  professionalId: string,
  limit: number = 10
): Promise<Array<FamilyProfile & { matchScore: number; matchDetails: any }>> {
  try {
    // Fetch the professional profile
    const { data: professionalData, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', professionalId)
      .eq('role', 'professional')
      .single();
    
    if (profError || !professionalData) {
      console.error('Error fetching professional profile:', profError);
      return [];
    }
    
    // Fetch all family profiles
    const { data: families, error: familyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'family');
    
    if (familyError || !families) {
      console.error('Error fetching family profiles:', familyError);
      return [];
    }
    
    // Get care recipient profiles for all families
    const { data: careRecipients, error: recipientError } = await supabase
      .from('care_recipient_profiles')
      .select('*');
      
    if (recipientError) {
      console.error('Error fetching care recipient profiles:', recipientError);
    }
    
    // Map care recipients to their families
    const careRecipientMap: Record<string, CareRecipientProfile> = {};
    if (careRecipients) {
      careRecipients.forEach(profile => {
        careRecipientMap[profile.user_id] = profile as CareRecipientProfile;
      });
    }
    
    // Calculate match scores for each family
    const matchPromises = families.map(async (family) => {
      const familyProfile: FamilyProfile = {
        ...family,
        care_recipient: careRecipientMap[family.id]
      };
      
      const matchResult = await calculateAdvancedMatchScore(
        familyProfile,
        professionalData
      );
      
      return {
        ...familyProfile,
        matchScore: matchResult.matchScore,
        matchDetails: matchResult.matchDetails
      };
    });
    
    const matches = await Promise.all(matchPromises);
    
    // Sort by match score and take the top ones
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error in getProfessionalMatches:', error);
    return [];
  }
}
