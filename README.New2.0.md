
# Takes a Village

<div align="center">
  <img src="public/og-image.png" alt="Takes a Village Logo" width="300" />
  <p><em>Coordinating care shouldn't be complicated</em></p>
</div>

## Overview

Takes a Village is a modern web application designed to simplify care coordination among families, professional caregivers, and community volunteers. Our platform creates a centralized hub where everyone involved in providing care can connect, communicate, and collaborate effectively.

## Why Takes a Village?

Care coordination often involves juggling multiple caregivers, appointments, medications, and services. Our platform addresses these challenges by:

- **Centralizing Communication**: One place for all care-related discussions
- **Streamlining Coordination**: Easy scheduling and task management
- **Building Community**: Connecting families with local support resources
- **Enhancing Accessibility**: Role-specific interfaces for everyone involved

## Key Features

### For Families

- **Comprehensive Dashboard**: Manage all aspects of care in one place
- **Team Management**: Coordinate with professionals and volunteers
- **Appointment Scheduling**: Keep track of all healthcare visits
- **Meal Planning**: Organize nutritional needs and dietary preferences

### For Professionals

- **Client Management**: Efficiently track care for multiple families
- **Documentation Tools**: Maintain organized, accessible records
- **Schedule Optimization**: Balance time across different clients
- **Professional Development**: Access training resources

### For Community Members

- **Volunteer Opportunities**: Find ways to help local families
- **Resource Sharing**: Connect families with community resources
- **Event Coordination**: Organize community support activities

## Technology Stack

Takes a Village is built with modern web technologies:

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: React Context, TanStack Query
- **Backend**: Supabase (Authentication, Database, Storage)
- **UI/UX**: Responsive design with Framer Motion animations

## Security & Privacy

We prioritize the security and privacy of all users:

- **Role-Based Access Control**: Users only see information relevant to their role
- **Row-Level Security**: Database policies ensure proper data access
- **Secure Authentication**: Industry-standard auth practices
- **Data Encryption**: Protection at rest and in transit

## User Flows

### Authentication Flows

#### Sign Up
1. User navigates to `/auth` page
2. User selects "Create Account"
3. User enters email, password, and selects a role (Family, Professional, or Community)
4. Upon successful signup, user is redirected to the appropriate registration page based on their role

#### Sign In
1. User navigates to `/auth` page
2. User enters email and password
3. Upon successful login:
   - User with complete profile is redirected to their role-specific dashboard
   - User with incomplete profile is redirected to the appropriate registration page

#### Sign Out
1. User clicks "Sign Out" button in the navigation bar
2. User is logged out and redirected to the home page

### Role-Specific User Flows

#### Family Users
1. **Dashboard Navigation**:
   - Access via `/dashboard/family`
   - Can navigate to Features page via navigation menu
   - Can access Role-specific Features Overview via "Learn More" buttons

2. **Feature Interaction**:
   - Can upvote features from dashboard cards or features page
   - Upvote status persists across sessions
   - Upvote count updates in real-time

#### Professional Users
1. **Dashboard Navigation**:
   - Access via `/dashboard/professional`
   - Can navigate to Features page via navigation menu
   - Can access Professional Features Overview via "Manage Profile", "Access Tools", "Learn More", or "Learn About Agency Features" buttons

2. **Feature Interaction**:
   - Can upvote features from dashboard cards or features page
   - Upvote status persists across sessions
   - Upvote count updates in real-time

#### Community Users
1. **Dashboard Navigation**:
   - Access via `/dashboard/community`
   - Can navigate to Features page via navigation menu
   - Can access Community Features Overview via dashboard buttons

2. **Feature Interaction**:
   - Can upvote features from dashboard cards or features page
   - Upvote status persists across sessions
   - Upvote count updates in real-time

### Feature Upvoting System

The feature upvoting system allows users to express interest in upcoming features. Here's how it works:

1. **Upvote Logic**:
   - Unauthenticated users are prompted to sign in before voting
   - Users can toggle their vote on/off by clicking the upvote button
   - One vote per user per feature
   - Visual feedback shows the current vote status and count

2. **Technical Implementation**:
   - Feature records are stored in the `features` table
   - Votes are stored in the `feature_upvotes` table with relations to users and features
   - Optimistic UI updates provide immediate feedback
   - Server validation ensures data integrity

3. **Special Cases**:
   - If a user attempts to upvote while logged out, the vote intent is saved and processed after login
   - After processing a pending vote, users are redirected to their dashboard

## Navigation Structure

### Global Navigation
- **Home**: `/` - Landing page for all users
- **Features**: `/features` - Overview of all available and upcoming features
- **Dashboards Dropdown**:
  - **Family Dashboard**: `/dashboard/family`
  - **Professional Dashboard**: `/dashboard/professional`
  - **Community Dashboard**: `/dashboard/community`
- **Auth**: `/auth` - Sign in/Sign up page
- **Sign Out**: Logs user out and redirects to home page

### Role-Specific Navigation
- **Family**:
  - **Family Dashboard**: `/dashboard/family`
  - **Family Features Overview**: `/family/features-overview`
  
- **Professional**:
  - **Professional Dashboard**: `/dashboard/professional`
  - **Professional Features Overview**: `/professional/features-overview`
  
- **Community**:
  - **Community Dashboard**: `/dashboard/community`
  - **Community Features Overview**: `/community/community-features-overview`

### Registration Pages
- **Family Registration**: `/registration/family`
- **Professional Registration**: `/registration/professional`
- **Community Registration**: `/registration/community`

### Support Pages
- **FAQ**: `/faq` - Frequently asked questions

## Redirection Rules

### Authentication Redirects
- **Unauthenticated to Protected Page**: Redirected to `/auth` with notification
- **Post-Login**: 
  - With complete profile: Redirected to role-specific dashboard
  - With incomplete profile: Redirected to role-specific registration page
- **Post-Logout**: Redirected to home page

### Role-Specific Redirects
- **Family Users**: 
  - Can freely navigate between dashboard, features, and role-specific pages
  - Dashboard serves as the central hub
  
- **Professional Users**:
  - Initial login or auth page visits redirect to professional dashboard
  - Can freely navigate to features and professional-specific pages
  - No forced redirects back to dashboard during normal navigation
  
- **Community Users**:
  - Can freely navigate between dashboard, features, and role-specific pages
  - Dashboard serves as the central hub

### Special Redirect Cases
- **Pending Feature Upvote**: After login, processes upvote and redirects to dashboard
- **Incorrect Registration Page**: Redirects user to the correct registration page for their role
- **Auth Timeout Recovery**: Handles session timeout gracefully with recovery mechanisms

## Project Status

Takes a Village is under active development with new features being added regularly. Visit our Features page to see what's coming next and vote on priorities.

## Getting Started

### For Users

1. Create an account based on your role (Family, Professional, or Community)
2. Complete your profile
3. Connect with your care network
4. Start using your personalized dashboard

### For Developers

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Contributing

We welcome contributions from developers of all skill levels! Please read our contributing guidelines before submitting pull requests.

## Support

Need help or have questions? Join our [Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613) for support.

## License

This project is proprietary and confidential. All rights reserved.

## Technical Specifications

### Authentication & User Management

#### Technology Stack
- **Backend**: Supabase Authentication Service
- **Frontend**: React + TypeScript
- **State Management**: React Context API
- **Data Fetching**: TanStack Query

#### User Authentication
- **Authentication Method**: Email/password with JWT token-based session management
- **Session Handling**: Persistent sessions with automatic token refresh
- **Security Features**: CSRF protection, secure cookies, XSS prevention
- **Password Requirements**: Minimum 8 characters with complexity requirements

#### User Registration
- **Registration Flow**: Role-based multi-step registration forms
- **Available Roles**: Family, Professional, Community, Admin
- **Profile Data**: Role-specific fields with validation
- **Email Verification**: Optional verification with Supabase email templates

#### Role-Based Access Control
- **Role Definition**: Roles stored in dedicated profiles table with Supabase RLS
- **Authorization**: Row-Level Security policies based on user role and ID
- **Navigation Guards**: Client-side route protection with requireAuth hook
- **Admin Controls**: Separate admin dashboard with user management capabilities

#### Data Security
- **Database Security**: Supabase Row-Level Security (RLS) policies
- **API Security**: JWT validation for all authenticated requests
- **Storage Security**: Secured file access with role-based permissions
- **Profile Data**: Encrypted secure fields for sensitive information

### Feature Upvoting System

#### Technology Stack
- **Database**: Supabase PostgreSQL tables for features and votes
- **State Management**: Local React state + TanStack Query for caching
- **Real-time Updates**: Supabase subscriptions for live vote counts

#### Implementation Details
- **Feature Storage**: Dedicated features and feature_upvotes tables
- **Vote Handling**: One vote per user per feature with toggle capability
- **Data Relations**: User-to-votes relation with proper foreign keys
- **Cache Invalidation**: Optimistic UI updates with fallback error handling
- **UUID Validation**: Server-side validation ensures valid feature IDs
- **Error Handling**: Comprehensive error handling with user feedback
- **Edge Cases**: Handling for race conditions and concurrent vote attempts

### Deployment & DevOps

#### CI/CD Pipeline
- **Continuous Integration**: GitHub Actions for automated testing
- **Continuous Deployment**: Vercel integration with preview deployments
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Jest and React Testing Library

#### Environment Configuration
- **Development**: Local Supabase instance with .env.local configuration
- **Staging**: Preview deployments with isolated Supabase staging project
- **Production**: Production Supabase instance with enhanced security

#### Infrastructure
- **Hosting**: Vercel for frontend, Supabase for backend
- **CDN**: Vercel Edge Network for static assets
- **Database**: Supabase PostgreSQL with automated backups
- **File Storage**: Supabase Storage for user uploads and media

### Performance Optimization

- **Bundle Optimization**: Code splitting, tree shaking, dynamic imports
- **Image Optimization**: Responsive images, WebP format, lazy loading
- **Caching Strategy**: TanStack Query with stale-while-revalidate pattern
- **API Efficiency**: Batched requests, query optimization, minimal payloads
- **Debouncing**: Rate limiting for API-intensive operations like upvoting
- **Lazy Loading**: Component and route-based code splitting

### Monitoring & Analytics

- **Error Tracking**: Sentry integration for frontend and backend errors
- **Performance Monitoring**: Vercel Analytics for core web vitals
- **Usage Analytics**: Anonymous event tracking for feature usage
- **Logging**: Structured logging with severity levels and context
- **User Flow Tracking**: Capture key user journey events to identify friction points

### Package Development & Reusability

#### Modular Architecture
- **Component Library**: Standalone UI component library with Storybook documentation
- **Hook Library**: Collection of reusable React hooks for auth, data fetching, and form handling
- **Context Providers**: Configurable context providers with dependency injection
- **TypeScript Types**: Shared type definitions across packages and applications

#### Package Distribution
- **GitHub Packages**: Private npm registry for organization-wide access
- **Versioning Strategy**: Semantic versioning with automated release notes
- **Documentation**: Auto-generated API documentation and usage examples
- **Changelog**: Automated changelog generation from commit messages

#### Integration Strategies
- **Framework Agnostic Core**: Core logic separated from UI for cross-framework support
- **Plugin System**: Extensible plugin architecture for custom authentication providers
- **Theming Support**: Design token system for consistent styling across applications
- **i18n Integration**: Built-in internationalization support for multi-language deployments

#### Compatibility & Standards
- **Accessibility**: WCAG 2.1 AA compliance with automated testing
- **Browser Support**: Compatibility with modern browsers and graceful degradation
- **Mobile Responsiveness**: Responsive design patterns and touch-friendly interactions
- **API Standards**: RESTful API design principles and OpenAPI documentation
