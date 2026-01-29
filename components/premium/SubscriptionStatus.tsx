"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "./PremiumBadge";
import Link from "next/link";
import { getDaysRemaining, formatSubscriptionStatus } from "@/lib/subscription-helpers";

export function SubscriptionStatus() {
  const { data: session } = useSession();

  const subscription = (session?.user as any)?.subscription || {
    tier: "free",
    status: "active",
  };

  const isPremium = subscription.tier === "premium";
  const daysRemaining = subscription.currentPeriodEnd
    ? getDaysRemaining(subscription.currentPeriodEnd)
    : null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span style={{ color: "#0D5F3A" }}>Your Subscription</span>
          {isPremium && <PremiumBadge />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
          <p className="text-2xl font-bold" style={{ color: "#0D5F3A" }}>
            {isPremium ? "Premium" : "Free"}
          </p>
          {isPremium && (
            <p className="text-sm text-muted-foreground mt-1">
              Status: {formatSubscriptionStatus(subscription)}
            </p>
          )}
        </div>

        {isPremium && daysRemaining !== null && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(232, 166, 40, 0.1)" }}>
            <p className="text-sm font-medium" style={{ color: "#E8A628" }}>
              {daysRemaining > 0
                ? `${daysRemaining} days remaining in current period`
                : "Subscription period ended"}
            </p>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-xs text-muted-foreground mt-1">
                Your subscription will not renew automatically
              </p>
            )}
          </div>
        )}

        {!isPremium && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Upgrade to Premium to unlock AI-powered features and unlimited access.
            </p>
            <Link href="/premium">
              <Button
                className="w-full font-semibold"
                style={{
                  background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
                  color: "white",
                }}
              >
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        )}

        {isPremium && (
          <div className="space-y-2">
            <Link href="/account/subscription" className="block">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
            <Link href="/account/billing" className="block">
              <Button variant="ghost" className="w-full">
                View Billing History
              </Button>
            </Link>
          </div>
        )}

        {!isPremium && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Premium includes: AI Chef • Recipe Generator • Meal Planner • Unlimited Favorites
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
