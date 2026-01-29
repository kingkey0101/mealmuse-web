"use client";

import { useSession } from "next-auth/react";
import { canAccessFeature, FeatureKey, FEATURES } from "@/lib/features";
import { UpgradePrompt } from "./UpgradePrompt";
import { ReactNode } from "react";

interface PremiumGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  currentUsage?: number;
  showFallback?: boolean;
}

export function PremiumGate({
  feature,
  children,
  fallback,
  currentUsage,
  showFallback = true,
}: PremiumGateProps) {
  const { data: session } = useSession();

  // Default to free tier if no session
  const userTier = (session?.user as any)?.tier || "free";
  const subscriptionStatus = (session?.user as any)?.subscription?.status;

  // Check if user can access the feature
  const access = canAccessFeature(feature, userTier, currentUsage, subscriptionStatus);

  // If access is allowed, render children
  if (access.allowed) {
    return <>{children}</>;
  }

  // If access is denied and we should show fallback
  if (showFallback) {
    return fallback || <UpgradePrompt feature={feature} reason={access.reason} />;
  }

  // Otherwise, render nothing
  return null;
}

/**
 * Inline gate - just hides content without showing upgrade prompt
 */
export function PremiumGateInline({ feature, children }: Omit<PremiumGateProps, "fallback">) {
  return (
    <PremiumGate feature={feature} showFallback={false}>
      {children}
    </PremiumGate>
  );
}

/**
 * Check if feature is accessible (hook for conditional logic)
 */
export function useFeatureAccess(feature: FeatureKey, currentUsage?: number) {
  const { data: session } = useSession();

  const userTier = (session?.user as any)?.tier || "free";
  const subscriptionStatus = (session?.user as any)?.subscription?.status;

  return canAccessFeature(feature, userTier, currentUsage, subscriptionStatus);
}

/**
 * Get feature info for display
 */
export function useFeatureInfo(feature: FeatureKey) {
  return FEATURES[feature];
}
