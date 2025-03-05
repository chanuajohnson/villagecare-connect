
# Debug Errors and Fixes

This document provides a comprehensive overview of errors encountered during the development of the Takes a Village application, along with their fixes and best practices to avoid similar issues in the future.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
   - [Session Management](#session-management)
   - [Role Determination](#role-determination)
   - [Timeout Handling](#timeout-handling)
2. [Data Management](#data-management)
   - [Row Level Security (RLS)](#row-level-security-rls)
   - [Database Query Errors](#database-query-errors)
3. [Navigation and Routing](#navigation-and-routing)
   - [Redirect Loops](#redirect-loops)
   - [Protected Routes](#protected-routes)
4. [Performance Optimization](#performance-optimization)
5. [Best Practices & Must-Implements](#best-practices--must-implements)

## Authentication Issues

### Session Management

#### Error: Session Not Found

**Symptoms:**
- Users experiencing "Session not found" errors in logs
- Authentication operations failing after success messages
- Console logs showing:
```
[AuthProvider] Auth state changed: SIGNED_IN Has session
[AuthProvider] User signed in or token refreshed
[AuthProvider] Session id doesn't exist
```

**Root Cause:**
The authentication flow was not properly handling session retrieval and validation. The system would indicate a sign-in but fail to establish a persistent session.

**Fix:**

1. **Explicit Session Verification:**
```typescript
// After login attempt, explicitly verify session
const { data: sessionData, error: sessionError } = 
  await supabase.auth.getSession();

if (sessionError) {
  console.error('[AuthProvider] Error getting session:', sessionError);
  throw sessionError;
} else if (!sessionData.session) {
  console.error('[AuthProvider] Session not established after login');
  throw new Error('Failed to establish session');
}
```

2. **Improved Session Listeners:**
```typescript
// Enhanced auth state change listener
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, newSession) => {
      console.log('[AuthProvider] Auth state changed:', event, 
        newSession ? 'Has session' : 'No session');
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('[AuthProvider] User signed in or token refreshed');
        setLoadingWithTimeout(true, `auth-state-change-${event}`);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Wait for session to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify session is fully established
        const { data: verifySession } = await supabase.auth.getSession();
        if (!verifySession.session) {
          console.error('[AuthProvider] Session verification failed');
          handleSignOut();
          return;
        }
        
        // Continue with role determination...
      }
    }
  );
  
  return () => {
    subscription?.unsubscribe();
  };
}, []);
```

3. **Session Cleanup on Sign Out:**
```typescript
const handleSignOut = async () => {
  setLoadingWithTimeout(true, 'sign-out');
  try {
    await supabase.auth.signOut();
    // Clear all auth state
    setSession(null);
    setUser(null);
    setUserRole(null);
    setIsProfileComplete(false);
    
    // Clear any local storage remnants
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('authStateError');
    
    navigate('/');
  } catch (error) {
    console.error('[AuthProvider] Error signing out:', error);
  } finally {
    setLoadingWithTimeout(false, 'sign-out');
  }
};
```

**Best Practice:**
- Always verify session establishment after authentication operations
- Implement proper cleanup of all auth state during sign-out
- Add explicit logging of auth state changes for better debugging
- Use timeouts to prevent UI from getting stuck in loading states

### Role Determination

#### Error: Null User Role

**Symptoms:**
- Users redirected to incorrect registration flows
- Profile data inaccessible despite successful authentication
- Console logs showing:
```
[AuthProvider] Render state: {
  "hasSession": true, 
  "hasUser": true,
  "userRole": null,
  "isLoading": true,
  "isProfileComplete": false
}
```

**Root Cause:**
The role determination process failed to properly retrieve and set the user role, leading to null values and incorrect redirections.

**Fix:**

1. **Multi-step Role Retrieval:**
```typescript
// Improved getUserRole function with fallbacks
const getUserRole = async (userId: string): Promise<UserRole | null> => {
  console.log('[AuthProvider] Getting role for signed in user...');
  
  try {
    // Step 1: Try to get from user metadata (fastest)
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role) {
      console.log('[AuthProvider] Role found in user metadata:', user.user_metadata.role);
      return user.user_metadata.role as UserRole;
    }
    
    // Step 2: Try to get from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('[AuthProvider] Error fetching role from profiles:', error);
      // Continue to next fallback
    } else if (profile?.role) {
      console.log('[AuthProvider] Role found in profiles table:', profile.role);
      return profile.role as UserRole;
    }
    
    // Step 3: Check if there's a role intent in localStorage
    const registrationIntent = localStorage.getItem('registrationRole');
    if (registrationIntent) {
      console.log('[AuthProvider] Using registration intent from localStorage:', registrationIntent);
      return registrationIntent as UserRole;
    }
    
    console.warn('[AuthProvider] Could not determine user role');
    return null;
  } catch (error) {
    console.error('[AuthProvider] Error in getUserRole:', error);
    return null;
  }
};
```

2. **Role Synchronization:**
```typescript
// Ensure user metadata and profile role are in sync
const syncUserRole = async (userId: string, role: UserRole) => {
  try {
    // Update user metadata
    await supabase.auth.updateUser({
      data: { role }
    });
    
    // Update profiles table
    await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        role,
        updated_at: new Date().toISOString()
      });
      
    console.log('[AuthProvider] Role synchronized successfully:', role);
  } catch (error) {
    console.error('[AuthProvider] Error synchronizing role:', error);
  }
};
```

3. **Retry Logic:**
```typescript
// Implement retry logic for role determination
const getRoleWithRetry = async (userId: string, maxRetries = 3): Promise<UserRole | null> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    const role = await getUserRole(userId);
    if (role) return role;
    
    retries++;
    console.log(`[AuthProvider] Retry ${retries}/${maxRetries} for role determination`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between retries
  }
  
  console.error('[AuthProvider] Maximum retries reached for role determination');
  return null;
};
```

**Best Practice:**
- Implement multiple fallback mechanisms for retrieving critical data
- Add retry logic for operations that might fail due to race conditions
- Synchronize data between user metadata and database tables
- Add detailed logging at each step of the process

### Timeout Handling

#### Error: Authentication Timeouts

**Symptoms:**
- UI stuck in loading state
- Operations timing out with message: "Authentication operation timed out"
- Console logs showing:
```
[AuthProvider] TIMEOUT reached for: auth-state-change-SIGNED_IN - forcibly ending loading state
```

**Root Cause:**
Authentication operations took too long or failed silently, causing the UI to remain in a loading state indefinitely.

**Fix:**

1. **Improved Timeout Mechanism:**
```typescript
// Enhanced loading timeout handling
const LOADING_TIMEOUT_MS = 15000; // Increased from 5000 to 15000

const setLoadingWithTimeout = (loading: boolean, operation: string) => {
  if (loadingTimeoutRef.current) {
    console.log('[AuthProvider] Clearing loading timeout');
    clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = null;
  }
  
  setIsLoading(loading);
  
  if (loading) {
    console.log(`[AuthProvider] START loading state for: ${operation}`);
    console.log(`[AuthProvider] Setting loading timeout for: ${operation} (${LOADING_TIMEOUT_MS}ms)`);
    
    loadingTimeoutRef.current = setTimeout(() => {
      console.log(`[AuthProvider] TIMEOUT reached for: ${operation} - forcibly ending loading state`);
      setIsLoading(false);
      
      // Recovery actions based on operation type
      if (operation.includes('sign-in') || operation.includes('fetch-role')) {
        console.log('[AuthProvider] Performing recovery for authentication timeout');
        localStorage.setItem('authStateError', 'true');
        
        // Force sign-out to clean up state
        supabase.auth.signOut().catch(e => 
          console.error('[AuthProvider] Error in timeout recovery signout:', e)
        );
        
        // Reset auth state
        setSession(null);
        setUser(null);
        setUserRole(null);
        setIsProfileComplete(false);
        
        // Show error to user
        toast({
          title: "Authentication Error",
          description: "Authentication operation timed out. Please refresh the page and try again.",
          variant: "destructive"
        });
      }
    }, LOADING_TIMEOUT_MS);
  } else {
    console.log(`[AuthProvider] END loading state for: ${operation}`);
  }
};
```

2. **Graceful Recovery from Previous Errors:**
```typescript
// Check for and recover from previous auth errors on initial load
useEffect(() => {
  const checkAuthState = async () => {
    // Check for previous auth errors
    const hadAuthError = localStorage.getItem('authStateError');
    if (hadAuthError) {
      console.log('[AuthProvider] Recovering from previous auth error');
      localStorage.removeItem('authStateError');
      await supabase.auth.signOut();
      
      // Reset all auth state
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      
      toast({
        title: "Authentication Reset",
        description: "Previous authentication error detected. Please sign in again.",
        variant: "default"
      });
    }
    
    // Continue with normal initialization...
  };
  
  checkAuthState();
}, []);
```

**Best Practice:**
- Implement timeout safeguards for all asynchronous operations
- Increase timeout values for operations involving multiple steps
- Add recovery mechanisms for timeout situations
- Provide clear error messages to users when timeouts occur

## Data Management

### Row Level Security (RLS)

#### Error: RLS Policy Violations

**Symptoms:**
- Database operations failing with "new row violates row-level security policy"
- Users unable to access their own data
- Specific data only visible to certain roles

**Root Cause:**
Row Level Security policies were incorrectly configured or not enforcing proper access controls.

**Fix:**

1. **User-Based RLS Policy:**
```sql
-- Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow insert during registration with correct ID
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);
```

2. **Role-Based RLS Policy:**
```sql
-- Function to get current user role safely
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Admin users can see all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (get_user_role() = 'admin');

-- Feature data visible to all authenticated users
CREATE POLICY "Features visible to authenticated users" ON features
FOR SELECT USING (auth.role() = 'authenticated');
```

**Best Practice:**
- Always enable RLS on tables with user data
- Use security definer functions to avoid policy recursion
- Implement both user-based and role-based policies
- Test RLS policies with different user roles

### Database Query Errors

#### Error: Database Query Failures

**Symptoms:**
- Data retrieval operations failing
- Console showing 404 or 500 errors from Supabase requests
- Missing or incomplete data in UI components

**Root Cause:**
Issues with database queries including incorrect table names, missing columns, or insufficient error handling.

**Fix:**

1. **Robust Query Error Handling:**
```typescript
// Improved error handling for database queries
const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('User profile not found, may need to be created');
        return null;
      }
      
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in fetchUserProfile:', error);
    toast({
      title: "Data Error",
      description: "Failed to retrieve your profile data. Please refresh and try again.",
      variant: "destructive"
    });
    return null;
  }
};
```

2. **Query Performance Improvements:**
```typescript
// Optimized queries with column specification
const fetchUserData = async (userId: string) => {
  try {
    // Only select needed columns instead of '*'
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, is_profile_complete')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};
```

3. **Transactions for Related Operations:**
```typescript
// Use transactions for operations that modify multiple tables
const createUserProfile = async (profileData, preferences) => {
  try {
    // Start a transaction block
    const { error: transactionError } = await supabase.rpc('create_user_profile', {
      profile_data: profileData,
      preferences_data: preferences
    });
    
    if (transactionError) throw transactionError;
    
    return { success: true };
  } catch (error) {
    console.error('Error in createUserProfile transaction:', error);
    return { success: false, error };
  }
};
```

**Best Practice:**
- Handle database errors gracefully with user-friendly messages
- Use specific column selection instead of '*' for better performance
- Implement transactions for operations affecting multiple tables
- Add meaningful logging for database operations

## Navigation and Routing

### Redirect Loops

#### Error: Infinite Redirect Loops

**Symptoms:**
- Browser showing "too many redirects" error
- Application stuck in loading state
- URL constantly changing between routes

**Root Cause:**
Circular logic in navigation guards and redirection code causing infinite loops.

**Fix:**

1. **Safe Navigation Guards:**
```typescript
// Enhanced route protection logic
const ProtectedRoute = ({ children }) => {
  const { hasSession, userRole, isLoading, isProfileComplete } = useAuth();
  const location = useLocation();
  
  // Prevent redirect loops by checking current path
  const isAtLoginPage = location.pathname === '/auth';
  const isAtRegistrationPage = location.pathname.startsWith('/registration');
  
  useEffect(() => {
    console.log('ProtectedRoute check:', {
      hasSession,
      userRole,
      isLoading,
      isProfileComplete,
      path: location.pathname
    });
  }, [hasSession, userRole, isLoading, isProfileComplete, location.pathname]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Case 1: Not logged in - send to login unless already there
  if (!hasSession && !isAtLoginPage) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Case 2: Logged in but on login page - redirect to appropriate destination
  if (hasSession && isAtLoginPage) {
    const destination = !isProfileComplete ? 
      getRegistrationPath(userRole) : 
      getDashboardPath(userRole);
    return <Navigate to={destination} replace />;
  }
  
  // Case 3: Profile incomplete - redirect to registration unless already there
  if (hasSession && !isProfileComplete && !isAtRegistrationPage) {
    return <Navigate to={getRegistrationPath(userRole)} replace />;
  }
  
  // All checks passed, render the protected content
  return <>{children}</>;
};
```

2. **Path State Tracking:**
```typescript
// Track navigation history to prevent loops
const NavigationTracker = () => {
  const location = useLocation();
  const [previousPaths, setPreviousPaths] = useState<string[]>([]);
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check for potential loops
    if (
      previousPaths.length >= 3 && 
      previousPaths[0] === currentPath && 
      previousPaths[1] === previousPaths[previousPaths.length - 1]
    ) {
      console.error('Navigation loop detected!', previousPaths);
      // Force reset to a safe location
      window.location.href = '/';
      return;
    }
    
    // Update path history
    setPreviousPaths(prev => {
      const updated = [...prev, currentPath];
      return updated.slice(-5); // Keep last 5 paths
    });
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};
```

**Best Practice:**
- Implement loop detection in navigation logic
- Add comprehensive logging of route changes
- Use state tracking to detect and prevent circular redirections
- Ensure fallback mechanisms when navigation issues occur

### Protected Routes

#### Error: Incorrect Route Protection

**Symptoms:**
- Unauthenticated users accessing protected routes
- Authenticated users unable to access appropriate routes
- Inconsistent behavior in route protection

**Root Cause:**
Routing configuration not properly checking authentication status or user roles.

**Fix:**

1. **Role-Based Route Protection:**
```typescript
// Enhanced role-based route protection
const RoleProtectedRoute = ({ requiredRoles, children }) => {
  const { hasSession, userRole, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!hasSession) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Allow access if the user's role is in the list of required roles
  if (userRole && requiredRoles.includes(userRole)) {
    return <>{children}</>;
  }
  
  // User doesn't have the required role
  return <Navigate to="/unauthorized" replace />;
};

// Usage in routes
<Route 
  path="/dashboard/admin" 
  element={
    <RoleProtectedRoute requiredRoles={['admin']}>
      <AdminDashboard />
    </RoleProtectedRoute>
  } 
/>
```

2. **Centralized Route Configuration:**
```typescript
// Centralized route configuration with protection levels
const routeConfig = [
  {
    path: '/',
    element: <HomePage />,
    public: true
  },
  {
    path: '/auth',
    element: <AuthPage />,
    public: true,
    authRedirect: true // Redirect if already authenticated
  },
  {
    path: '/dashboard/family',
    element: <FamilyDashboard />,
    requiredRoles: ['family'],
    requiresCompleteProfile: true
  },
  {
    path: '/registration/professional',
    element: <ProfessionalRegistration />,
    requiredRoles: ['professional'],
    requiresIncompleteProfile: true // Only accessible with incomplete profile
  }
];

// Route renderer
const renderRoutes = () => routeConfig.map(route => {
  const RouteElement = () => {
    // Apply appropriate protection based on route config
    if (route.public) {
      if (route.authRedirect) {
        return <AuthRedirectRoute>{route.element}</AuthRedirectRoute>;
      }
      return route.element;
    }
    
    if (route.requiredRoles) {
      return (
        <RoleProtectedRoute 
          requiredRoles={route.requiredRoles}
          requiresCompleteProfile={route.requiresCompleteProfile}
          requiresIncompleteProfile={route.requiresIncompleteProfile}
        >
          {route.element}
        </RoleProtectedRoute>
      );
    }
    
    return <ProtectedRoute>{route.element}</ProtectedRoute>;
  };
  
  return <Route key={route.path} path={route.path} element={<RouteElement />} />;
});
```

**Best Practice:**
- Implement centralized route configuration
- Use role-based access control for protected routes
- Add clear logging of access decisions
- Create dedicated components for different protection levels

## Performance Optimization

#### Error: Performance Issues

**Symptoms:**
- Slow rendering of components
- Excessive re-renders causing UI lag
- High memory usage and potential memory leaks

**Root Cause:**
Inefficient component rendering, unnecessary re-renders, or improper cleanup of effects and subscriptions.

**Fix:**

1. **Optimized Rendering:**
```typescript
// Use memo to prevent unnecessary re-renders
const UserProfileCard = React.memo(({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Only re-render if relevant properties change
  return prevProps.user.id === nextProps.user.id && 
         prevProps.user.name === nextProps.user.name &&
         prevProps.user.role === nextProps.user.role;
});
```

2. **Proper Effect Cleanup:**
```typescript
// Ensure proper cleanup of subscriptions and timers
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // Handle auth state changes...
    }
  );
  
  // Set up other subscriptions
  const profileSubscription = supabase
    .channel('profile-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'profiles',
      filter: `id=eq.${userId}`
    }, payload => {
      // Handle profile changes...
    })
    .subscribe();
  
  // Cleanup function
  return () => {
    subscription?.unsubscribe();
    profileSubscription?.unsubscribe();
    
    // Clear any timers
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };
}, [userId]);
```

3. **Optimized Data Fetching:**
```typescript
// Use React Query for efficient data fetching
const { data: userProfile, isLoading, error } = useQuery({
  queryKey: ['userProfile', userId],
  queryFn: () => fetchUserProfile(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 15 * 60 * 1000, // 15 minutes
  retry: 3,
  onError: (err) => {
    console.error('Error fetching user profile:', err);
    toast({
      title: "Error",
      description: "Failed to load your profile data",
      variant: "destructive"
    });
  }
});
```

**Best Practice:**
- Use React.memo for components that render frequently
- Implement proper cleanup in useEffect hooks
- Leverage React Query for efficient data fetching and caching
- Add custom equality functions to prevent unnecessary re-renders

## Best Practices & Must-Implements

### Authentication Best Practices

1. **Robust Session Management:**
   - Always verify session establishment after authentication
   - Implement proper session cleanup during sign-out
   - Use onAuthStateChange listeners to keep state in sync

2. **Multi-Step Role Determination:**
   - Check user metadata first (fastest)
   - Fall back to profiles table query
   - Use localStorage fallback for registration intent
   - Add retry logic for role determination

3. **Timeout Safeguards:**
   - Set reasonable timeouts for all async operations (15s recommended)
   - Implement graceful recovery from timeouts
   - Clear loading states even if operations fail
   - Provide clear error feedback to users

### Data Management Best Practices

1. **Security-First Database Design:**
   - Always enable RLS on tables with user data
   - Implement both user-based and role-based policies
   - Use security definer functions for complex policies
   - Test RLS with different user roles

2. **Robust Error Handling:**
   - Wrap all database operations in try/catch blocks
   - Provide user-friendly error messages
   - Log detailed error information for debugging
   - Implement retry logic for transient errors

3. **Query Optimization:**
   - Select specific columns instead of using '*'
   - Use appropriate indexes for frequently queried columns
   - Implement pagination for large datasets
   - Use transactions for operations affecting multiple tables

### Navigation Best Practices

1. **Secure Routing:**
   - Implement centralized route configuration
   - Use role-based access control for protected routes
   - Add loop detection in navigation logic
   - Create dedicated components for different protection levels

2. **User Experience:**
   - Show loading indicators during navigation
   - Provide clear error messages for access issues
   - Maintain navigation history for breadcrumbs
   - Implement smooth transitions between routes

### Performance Best Practices

1. **Efficient Rendering:**
   - Use React.memo for frequently re-rendered components
   - Implement useMemo for expensive computations
   - Leverage useCallback for function stability
   - Add custom equality functions to prevent unnecessary re-renders

2. **Effect Management:**
   - Ensure proper cleanup in useEffect hooks
   - Use appropriate dependency arrays
   - Avoid nested effects when possible
   - Clear timers and subscriptions on component unmount

3. **Optimized Data Flow:**
   - Use React Query for efficient data management
   - Implement proper caching strategies
   - Minimize prop drilling with context where appropriate
   - Use state management patterns for complex applications

### Must-Implements for Any Project

1. **Comprehensive Logging:**
   - Log all authentication events with clear identifiers
   - Include loading state changes in logs
   - Add detailed error reporting
   - Implement different log levels (info, warn, error)

2. **Error Recovery Mechanisms:**
   - Add automatic recovery from common errors
   - Implement fallbacks for critical features
   - Store error state for cross-session recovery
   - Provide self-healing capabilities where possible

3. **User Feedback:**
   - Show loading states for all async operations
   - Provide clear error messages for failures
   - Implement success confirmations for important actions
   - Use toast notifications for non-disruptive feedback

4. **Testing Strategy:**
   - Test authentication flows with different user types
   - Verify role-based access control
   - Simulate error conditions and recovery
   - Test performance under load and slow networks

By following these best practices and implementing the must-have features, you'll create a more robust, maintainable, and user-friendly application that can handle the complexities of authentication, data management, and user interactions.
