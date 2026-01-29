/**
 * Stripe Configuration and Client
 * Handles subscription pricing and Stripe SDK initialization
 */

import Stripe from "stripe";

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required in environment variables");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Subscription Plans Configuration
export const PLANS = {
  monthly: {
    name: "Premium Monthly",
    price: 9.99,
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY || "", // Will be set after Stripe setup
    interval: "month" as const,
    description: "Billed monthly, cancel anytime",
  },
  annual: {
    name: "Premium Annual",
    price: 99.99,
    priceId: process.env.STRIPE_PRICE_ID_ANNUAL || "", // Will be set after Stripe setup
    interval: "year" as const,
    description: "Billed annually, save 17%",
    savings: "$19.89/year",
  },
} as const;

export type PlanInterval = "monthly" | "annual";

/**
 * Get plan details by interval
 */
export function getPlan(interval: PlanInterval) {
  return PLANS[interval];
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Calculate savings for annual plan
 */
export function calculateAnnualSavings(): number {
  const monthlyTotal = PLANS.monthly.price * 12;
  const annualTotal = PLANS.annual.price;
  return monthlyTotal - annualTotal;
}
