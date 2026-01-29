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
  apiVersion: "2026-01-28.clover",
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
    price: 79,
    priceId: process.env.STRIPE_PRICE_ID_ANNUAL || "", // Will be set after Stripe setup
    interval: "year" as const,
    description: "Billed annually, save 34%",
    savings: "$40.88/year",
    regularPrice: 119.88, // $9.99 * 12 months
  },
  earlyAdopter: {
    name: "Early Adopter Special",
    price: 6.99,
    priceId: process.env.STRIPE_PRICE_ID_EARLY_ADOPTER || "", // Will be set after Stripe setup
    interval: "month" as const,
    description: "Limited time: First 50 users",
    subtitle: "Save 30% forever on monthly plan",
    slots: 50,
  },
} as const;

export type PlanInterval = "monthly" | "annual" | "earlyAdopter";

/**
 * Get plan details by interval
 */
export function getPlan(interval: PlanInterval | string) {
  if (interval === "earlyAdopter") {
    return PLANS.earlyAdopter;
  }
  return PLANS[interval as "monthly" | "annual"];
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
 * Calculate early adopter savings
 */
export function calculateEarlyAdopterSavings(): number {
  return PLANS.monthly.price - PLANS.earlyAdopter.price; // $3.00/month
}

/**
 * Calculate annual savings vs monthly
 */
export function calculateAnnualSavings(): number {
  const monthlyTotal = PLANS.monthly.price * 12;
  const annualTotal = PLANS.annual.price;
  return monthlyTotal - annualTotal;
}
