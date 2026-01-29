/**
 * Feature Flag System for MealMuse Premium
 * Defines all features and their access levels
 */

export type UserTier = "free" | "premium";

export interface Feature {
  name: string;
  tier: UserTier;
  icon: string;
  description: string;
  limit: {
    free: number;
    premium: number;
  };
}

export const FEATURES = {
  AI_CHAT: {
    name: "AI Chef Chatbot",
    tier: "premium" as UserTier,
    icon: "🤖",
    description: "Get personalized cooking advice from your AI sous chef",
    limit: { free: 0, premium: Infinity },
  },
  AI_RECIPE_GENERATOR: {
    name: "AI Recipe Generator",
    tier: "premium" as UserTier,
    icon: "✨",
    description: "Generate custom recipes based on ingredients you have",
    limit: { free: 0, premium: 100 }, // per month
  },
  AI_RECIPE_REWRITER: {
    name: "Recipe Rewriter",
    tier: "premium" as UserTier,
    icon: "🔄",
    description: "Adapt recipes to your dietary needs and preferences",
    limit: { free: 0, premium: 50 }, // per month
  },
  SHOPPING_LIST_AI: {
    name: "AI Shopping Assistant",
    tier: "premium" as UserTier,
    icon: "🛒",
    description: "Smart shopping lists with meal planning suggestions",
    limit: { free: 0, premium: Infinity },
  },
  FAVORITES: {
    name: "Favorite Recipes",
    tier: "free" as UserTier,
    icon: "❤️",
    description: "Save your favorite recipes for quick access",
    limit: { free: 10, premium: Infinity },
  },
  MEAL_PLANNER: {
    name: "Meal Planning",
    tier: "premium" as UserTier,
    icon: "📅",
    description: "Plan your weekly meals with calendar view",
    limit: { free: 0, premium: Infinity },
  },
  INGREDIENT_EXPLAINER: {
    name: "Ingredient Encyclopedia",
    tier: "premium" as UserTier,
    icon: "📚",
    description: "Learn about ingredients, substitutions, and nutrition",
    limit: { free: 0, premium: Infinity },
  },
} as const;

export type FeatureKey = keyof typeof FEATURES;

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: "premium_required" | "limit_reached" | "subscription_inactive";
  remaining?: number;
  limit?: number;
}

/**
 * Check if a user can access a specific feature
 */
export function canAccessFeature(
  featureKey: FeatureKey,
  userTier: UserTier,
  currentUsage?: number,
  subscriptionStatus?: string
): FeatureAccessResult {
  const feature = FEATURES[featureKey];
  const limit = feature.limit[userTier];

  // Check if subscription is active (for premium users)
  if (userTier === "premium" && subscriptionStatus && subscriptionStatus !== "active") {
    return {
      allowed: false,
      reason: "subscription_inactive",
    };
  }

  // Check if feature requires premium tier
  if (feature.tier === "premium" && userTier !== "premium") {
    return {
      allowed: false,
      reason: "premium_required",
    };
  }

  // Check usage limits
  if (limit !== Infinity && currentUsage !== undefined) {
    if (currentUsage >= limit) {
      return {
        allowed: false,
        reason: "limit_reached",
        remaining: 0,
        limit,
      };
    }

    return {
      allowed: true,
      remaining: limit - currentUsage,
      limit,
    };
  }

  return { allowed: true };
}

/**
 * Get all features available to a user tier
 */
export function getAvailableFeatures(userTier: UserTier): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, feature]) => feature.tier === "free" || userTier === "premium")
    .map(([key]) => key as FeatureKey);
}

/**
 * Get premium-only features
 */
export function getPremiumFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, feature]) => feature.tier === "premium")
    .map(([key]) => key as FeatureKey);
}

/**
 * Check if a feature has usage limits
 */
export function hasUsageLimit(featureKey: FeatureKey, userTier: UserTier): boolean {
  const feature = FEATURES[featureKey];
  return feature.limit[userTier] !== Infinity;
}
