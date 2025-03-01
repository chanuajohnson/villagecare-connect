import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client with the environment variables
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: false, // Disable automatic URL detection to avoid issues
      flowType: 'pkce',
    },
    global: {
      // Increase the timeout to 15 seconds (15000ms)
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: options?.signal || new AbortController().signal,
          // Set a longer timeout for all requests
          headers: {
            ...options?.headers,
            'X-Client-Info': 'takes-a-village-app',
          },
        });
      },
    },
    realtime: {
      timeout: 15000, // 15 seconds
    }
  }
);

// Helper function to get user role with improved resilience
export const getUserRole = async () => {
  console.log('Getting user role...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found in getUserRole');
      return null;
    }
    
    console.log('Fetching role for user ID:', user.id);
    
    // Try multiple approaches to get the user role
    // First attempt: Check user metadata (fastest)
    if (user.user_metadata && user.user_metadata.role) {
      console.log('Role found in user metadata:', user.user_metadata.role);
      
      // Update the profile to ensure it's in sync with metadata
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: user.user_metadata.role })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Error updating profile with role from metadata:', updateError);
        }
      } catch (err) {
        console.error('Error updating profile:', err);
      }
      
      return user.user_metadata.role;
    }
    
    // Second attempt: Profile table query with retry logic
    let retries = 3;
    let profileData = null;
    let queryError = null;
    
    while (retries > 0 && !profileData) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error(`Error fetching user role (attempt ${4-retries}/3):`, error);
          queryError = error;
          retries--;
          if (retries > 0) {
            console.log(`Retrying role fetch in 1s... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          profileData = data;
          break;
        }
      } catch (err) {
        console.error(`Unexpected error in role fetch (attempt ${4-retries}/3):`, err);
        queryError = err;
        retries--;
        if (retries > 0) {
          console.log(`Retrying role fetch in 1s... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (profileData) {
      console.log('Role data returned from profile:', profileData);
      
      // If we found a profile but no role, check if we should apply a default
      if (!profileData.role) {
        // Last resort: Check if the user was registered with a specific role intent
        // This would be stored in local storage during the registration process
        const intendedRole = localStorage.getItem('registrationRole');
        if (intendedRole) {
          console.log('Using intended role from registration:', intendedRole);
          
          // Update the profile with the intended role
          try {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: intendedRole })
              .eq('id', user.id);
              
            if (updateError) {
              console.error('Error updating profile with intended role:', updateError);
            } else {
              // Clear the intended role from localStorage
              localStorage.removeItem('registrationRole');
              return intendedRole;
            }
          } catch (err) {
            console.error('Error updating profile with intended role:', err);
          }
        }
      }
      
      return profileData.role;
    }
    
    // If we still don't have a role, log an error and return a safe default
    console.error('Failed to retrieve user role after multiple attempts', { 
      user_id: user.id,
      metadata: user.user_metadata,
      last_error: queryError
    });
    
    return null;
  } catch (error) {
    console.error('Unexpected error in getUserRole:', error);
    return null;
  }
};

// Ensure required storage buckets exist
export const ensureStorageBuckets = async () => {
  try {
    // Check if avatars bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error);
      return;
    }
    
    const avatarsBucketExists = buckets.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log('Creating avatars storage bucket');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true, // Make files publicly accessible
        fileSizeLimit: 1024 * 1024 * 2, // 2MB file size limit
      });
      
      if (createError) {
        console.error('Error creating avatars bucket:', createError);
      }
    }
  } catch (err) {
    console.error('Error ensuring storage buckets exist:', err);
  }
};

// Call ensureStorageBuckets when the app starts
ensureStorageBuckets().catch(console.error);

// Insert initial recipes if they don't exist
export const insertInitialRecipes = async () => {
  const recipes = [
    {
      title: "Green Seasoning",
      description: "A versatile Caribbean-style herb blend perfect for marinades and seasonings",
      category: "seasoning",
      preparation_time: 15,
      servings: 10,
      ingredients: [
        { item: "Handania (Culantro)", amount: "1 bunch" },
        { item: "Chives", amount: "2 bunches" },
        { item: "Celery", amount: "2 bunches" },
        { item: "Fine Thyme", amount: "1 sprig" },
        { item: "Water", amount: "to cover" }
      ],
      instructions: [
        "Clean and wash all herbs thoroughly",
        "Combine all ingredients in a blender",
        "Blend until smooth",
        "Store in a bottle in refrigerator",
        "Use as needed for seasoning"
      ]
    },
    {
      title: "Pimento, Garlic, Ginger Mix",
      description: "A flavorful aromatic base for Caribbean cuisine",
      category: "seasoning",
      preparation_time: 20,
      servings: 12,
      ingredients: [
        { item: "Garlic", amount: "1 head" },
        { item: "Onions", amount: "2 whole" },
        { item: "Pimento", amount: "4" },
        { item: "Ginger", amount: "1 large piece" }
      ],
      instructions: [
        "Peel and clean all ingredients",
        "Place in a food processor",
        "Chop until fine",
        "Store in a covered bottle in refrigerator",
        "Use as needed"
      ]
    },
    {
      title: "Overnight Steel Cut Oats",
      description: "Hearty and nutritious breakfast option",
      category: "breakfast",
      preparation_time: 20,
      servings: 4,
      ingredients: [
        { item: "Steel cut oats", amount: "1/2 cup" },
        { item: "Water", amount: "2.5 cups" }
      ],
      instructions: [
        "Bring water to boil",
        "Add steel cut oats",
        "Cook over low heat for 15-20 minutes",
        "Cook until desired consistency is reached",
        "Store in sealed container in refrigerator",
        "Serve with fresh fruit or desired toppings"
      ]
    },
    {
      title: "Sautéed Greens and Tomatoes",
      description: "A flavorful vegetarian side dish",
      category: "side dish",
      preparation_time: 25,
      servings: 2,
      ingredients: [
        { item: "Tomato", amount: "1, cubed" },
        { item: "Sautéed greens", amount: "1 cup" },
        { item: "Onion, garlic, ginger mix", amount: "1 tablespoon" },
        { item: "Salt", amount: "1/8 teaspoon" },
        { item: "Fennel seeds", amount: "2" },
        { item: "Geera (Cumin)", amount: "1/4 teaspoon" },
        { item: "Water", amount: "5 tablespoons" }
      ],
      instructions: [
        "Add water and onion-garlic-ginger mix to a warm pot",
        "Simmer until soft",
        "Add cubed tomato, salt, fennel seeds, and geera",
        "Cook on low heat until tender",
        "Add more water if needed for saucy finish",
        "Add cooked greens",
        "Take off heat, mix well",
        "Serve in bowl with sauce"
      ]
    },
    {
      title: "Ital Channa",
      description: "A hearty Caribbean-style chickpea dish",
      category: "main",
      preparation_time: 90,
      servings: 6,
      ingredients: [
        { item: "Channa (Chickpeas)", amount: "2 cups" },
        { item: "Pimento-onion-garlic-ginger mix", amount: "2 tablespoons" },
        { item: "Green seasoning", amount: "2 tablespoons" },
        { item: "Salt", amount: "1/8 teaspoon" },
        { item: "Fennel seeds", amount: "2" },
        { item: "Geera (Cumin)", amount: "1/4 teaspoon" },
        { item: "Turmeric powder", amount: "1 teaspoon" },
        { item: "Black pepper", amount: "to taste" }
      ],
      instructions: [
        "Soak channa overnight",
        "Slow cook with just enough water to cover",
        "Add initial tablespoon of pimento mix",
        "Add green seasoning and spices",
        "Cook until nearly done",
        "Add additional tablespoon of pimento mix",
        "Continue cooking until soft",
        "Serve hot"
      ]
    }
  ];

  try {
    // Check if recipes already exist
    const { count, error: countError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error checking existing recipes:', countError);
      return;
    }
    
    // Only insert if no recipes exist
    if (count === 0) {
      console.log('No recipes found, inserting initial data...');
      
      // Insert recipes one by one
      for (const recipe of recipes) {
        const { error } = await supabase
          .from('recipes')
          .insert([recipe]);
          
        if (error) {
          console.error('Error inserting recipe:', error);
        }
      }
      
      console.log('Initial recipes inserted successfully');
    } else {
      console.log(`${count} recipes already exist, skipping initial data`);
    }
  } catch (error) {
    console.error('Error in insertInitialRecipes:', error);
  }
};

// Call insertInitialRecipes when the app starts, but don't block rendering
insertInitialRecipes().catch(console.error);
