
# Breadcrumbs Implementation Guide

## Overview

Breadcrumbs in our application provide contextual navigation that allows users to understand where they are in the application hierarchy and navigate back to previous levels easily. This document outlines how breadcrumbs are implemented and should be used consistently across the application.

## Types of Breadcrumbs

Our application uses two types of breadcrumb implementations:

1. **Standard Breadcrumbs** - Used in dashboard and feature pages
2. **Dynamic Breadcrumbs** - Used in content pages with database-driven navigation (like training modules)

## Breadcrumb Components

### 1. DashboardHeader Component

The `DashboardHeader` component provides a consistent header with breadcrumb navigation for dashboard and feature pages.

```typescript
interface BreadcrumbItem {
  label: string;
  path: string;
}

interface DashboardHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
}
```

Usage example:
```typescript
const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Family",
    path: "/dashboard/family",
  },
];

<DashboardHeader breadcrumbItems={breadcrumbItems} />
```

### 2. Breadcrumb Component

The `Breadcrumb` component is a more advanced implementation used for dynamic content paths, especially in training modules, lessons, and other database-driven content.

Features:
- Automatically generates breadcrumbs based on the current URL path
- Provides loading states for asynchronously loaded content titles
- Supports custom referrer information for complex navigation flows
- Fetches actual page titles from the database for better context

Usage example:
```typescript
<Breadcrumb />
```

## Handling Redirects and Preserving Navigation Context

When redirecting users to pages like subscription pages, it's important to preserve the navigation context so users can easily return to where they came from. This is achieved by:

1. Using the `SubscriptionFeatureLink` component when linking to subscription-related features
2. Passing the referring page path and label when navigating to subscription pages
3. Storing the referring information in the location state

```typescript
<SubscriptionFeatureLink
  featureType="Premium Reports"
  returnPath="/dashboard/professional"
  referringPagePath="/dashboard/professional"
  referringPageLabel="Professional Dashboard"
>
  Access Premium Features
</SubscriptionFeatureLink>
```

## Best Practices

1. **Consistency**: Always use breadcrumbs on feature pages, settings pages, and content pages.
   
2. **Hierarchy**: Ensure breadcrumbs reflect the actual hierarchy of the application.
   
3. **Naming**: Use consistent labels for the same pages across different breadcrumb trails.
   
4. **Home Link**: Always include the Home link as the first item in breadcrumbs.
   
5. **Current Page**: The current page should be the last item in the breadcrumb trail and should not be clickable.
   
6. **Path Property**: Always use the `path` property (not `href`) when defining breadcrumb items.

7. **Preserving Context**: When redirecting users (especially for subscription features), always preserve the navigation context so users can easily return.

## Implementation Details

1. **Static Breadcrumbs**: For dashboard and static feature pages, manually define the breadcrumb items in the component.

2. **Dynamic Breadcrumbs**: For content pages like training modules, use the `Breadcrumb` component which automatically builds the breadcrumb trail based on the URL.

3. **Deep Linking**: For pages that require preserving navigation context (like subscription pages), use location state to store the referring page information.

## Troubleshooting

If breadcrumbs are not displaying correctly:

1. Check that breadcrumb items are defined with the correct `path` property (not `href`).
2. Ensure the breadcrumb items array is correctly ordered from highest to lowest in the hierarchy.
3. Verify that the DashboardHeader or Breadcrumb component is properly imported and rendered.
4. For dynamic breadcrumbs, check that the URL structure matches the expected pattern.

