
import { loadStripe } from '@stripe/stripe-js';

// Default to empty key for development - would be replaced with real key in production
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Initialize Stripe with a fallback for development
export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return !!stripePublishableKey;
};
