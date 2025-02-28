
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
      timeoutDuration: 60000 // Increased timeout from default to 60 seconds
    }
  }
);

// Helper function to get user role
export const getUserRole = async () => {
  console.log('Getting user role...');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('No user found in getUserRole');
    return null;
  }
  
  try {
    console.log('Fetching role for user ID:', user.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    console.log('Role data returned:', data);
    return data?.role;
  } catch (error) {
    console.error('Unexpected error in getUserRole:', error);
    return null;
  }
};

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
