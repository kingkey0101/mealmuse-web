/**
 * Subscription Helper Functions
 * Utilities for managing user subscriptions and premium status
 */

import { UserTier } from "./features";

export interface UserSubscription {
  tier: UserTier;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface UserLimits {
  favoritesUsed: number;
  aiRequestsThisMonth: number;
  lastResetDate: Date;
}

/**
 * Check if a subscription is currently active
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.tier === "free") return true;

  // Premium users need active or trialing status
  const validStatuses: UserSubscription["status"][] = ["active", "trialing"];
  if (!validStatuses.includes(subscription.status)) return false;

  // Check if subscription period has ended
  if (subscription.currentPeriodEnd) {
    const now = new Date();
    if (now > subscription.currentPeriodEnd) {
      return false;
    }
  }

  return true;
}

/**
 * Check if limits need to be reset (monthly)
 */
export function shouldResetLimits(lastResetDate: Date): boolean {
  const now = new Date();
  const lastReset = new Date(lastResetDate);

  // Reset on the 1st of each month
  return now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
}

/**
 * Get default subscription for new users
 */
export function getDefaultSubscription(): UserSubscription {
  return {
    tier: "free",
    status: "active",
  };
}

/**
 * Get default limits for new users
 */
export function getDefaultLimits(): UserLimits {
  return {
    favoritesUsed: 0,
    aiRequestsThisMonth: 0,
    lastResetDate: new Date(),
  };
}

/**
 * Calculate days remaining in subscription
 */
export function getDaysRemaining(currentPeriodEnd?: Date): number | null {
  if (!currentPeriodEnd) return null;

  const now = new Date();
  const end = new Date(currentPeriodEnd);
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(subscription: UserSubscription): string {
  if (subscription.tier === "free") return "Free Plan";

  const statusLabels: Record<UserSubscription["status"], string> = {
    active: "Active",
    trialing: "Trial Period",
    canceled: "Canceled",
    past_due: "Payment Due",
    incomplete: "Incomplete",
  };

  return statusLabels[subscription.status] || "Unknown";
}

/**
 * Check if user should see upgrade prompts
 */
export function shouldShowUpgradePrompt(subscription: UserSubscription): boolean {
  return subscription.tier === "free";
}

/**
 * Get appropriate CTA text based on subscription status
 */
export function getUpgradeCTA(subscription: UserSubscription): string {
  if (subscription.tier === "free") {
    return "Upgrade to Premium";
  }

  if (subscription.status === "canceled" && subscription.currentPeriodEnd) {
    const daysLeft = getDaysRemaining(subscription.currentPeriodEnd);
    if (daysLeft && daysLeft > 0) {
      return "Reactivate Premium";
    }
  }

  return "Manage Subscription";
}
