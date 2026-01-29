"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscriptionData {
  tier?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [managingPortal, setManagingPortal] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/stripe/subscription-status");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription || { tier: "free", status: "active" });
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  const isPremium = subscription.tier === "premium";

  const handleManageSubscription = async () => {
    setManagingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setManagingPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle style={{ color: "#0D5F3A" }}>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email Address</p>
            <p className="text-lg font-medium">{userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Member Since</p>
            <p className="text-lg font-medium">{session?.user?.email ? "Active" : "Loading..."}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span style={{ color: "#0D5F3A" }}>Subscription</span>
            {isPremium && (
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: "rgba(31, 162, 68, 0.1)", color: "#1FA244" }}
              >
                ✨ Premium
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading subscription details...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                  <p className="text-lg font-semibold" style={{ color: "#0D5F3A" }}>
                    {isPremium ? "Premium" : "Free"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-lg font-semibold capitalize" style={{ color: "#0D5F3A" }}>
                    {subscription.status}
                  </p>
                </div>
              </div>

              {isPremium ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-3">
                    Thank you for being a Premium member! Manage your billing, payment methods, and
                    view invoices.
                  </p>
                  <Button
                    onClick={handleManageSubscription}
                    disabled={managingPortal}
                    className="w-full"
                    style={{ backgroundColor: "#0D5F3A" }}
                  >
                    {managingPortal ? "Opening..." : "Manage Subscription & Billing"}
                  </Button>
                </div>
              ) : (
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "rgba(232, 166, 40, 0.1)",
                    borderLeft: "4px solid #E8A628",
                  }}
                >
                  <p className="text-sm text-gray-700 mb-3">
                    Upgrade to Premium to unlock AI features, unlimited favorites, and more!
                  </p>
                  <Link href="/premium" className="w-full block">
                    <Button
                      className="w-full"
                      style={{ backgroundColor: "#E8A628", color: "#000" }}
                    >
                      View Premium Plans
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Premium Features Info */}
      {!isPremium && (
        <Card className="shadow-lg border-l-4" style={{ borderLeftColor: "#1FA244" }}>
          <CardHeader>
            <CardTitle style={{ color: "#0D5F3A" }}>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-lg">🤖</span>
                <span>AI Chef Chat - Get personalized cooking advice</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">⭐</span>
                <span>Unlimited Favorites - Save all your favorite recipes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">📋</span>
                <span>Smart Shopping Lists - Generate lists from recipes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">🎯</span>
                <span>Custom Filters - Find recipes by dietary preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">📚</span>
                <span>Unlimited Recipes - Create and share unlimited recipes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">🚀</span>
                <span>Priority Support - Get help when you need it</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
