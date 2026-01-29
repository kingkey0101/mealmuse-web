"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SubscriptionStatus } from "@/components/premium/SubscriptionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    redirect("/auth/login");
  }

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error opening billing portal:", error);
      alert("Failed to open billing portal. Please try again.");
      setIsLoadingPortal(false);
    }
  };

  const userTier = (session.user as any)?.tier || "free";
  const isPremium = userTier === "premium";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: "#0D5F3A" }}>
            Subscription
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your subscription and billing settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Subscription Status Card */}
          <SubscriptionStatus />

          {/* Billing Management Card */}
          {isPremium && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: "#0D5F3A" }}>Billing Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Update your payment method, view invoices, or cancel your subscription through the
                  Stripe billing portal.
                </p>
                <Button
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                  size="lg"
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: "#0D5F3A",
                    color: "white",
                  }}
                >
                  {isLoadingPortal ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Opening...
                    </>
                  ) : (
                    "Open Billing Portal"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Premium Features Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#0D5F3A" }}>
                {isPremium ? "Your Premium Features" : "Premium Features"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-medium">AI Chef Chatbot</p>
                    <p className="text-sm text-muted-foreground">Get personalized cooking advice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="font-medium">AI Recipe Generator</p>
                    <p className="text-sm text-muted-foreground">Create recipes from ingredients</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-medium">Meal Planning</p>
                    <p className="text-sm text-muted-foreground">Plan your weekly meals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="font-medium">Smart Shopping List</p>
                    <p className="text-sm text-muted-foreground">AI-powered grocery planning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <p className="font-medium">Unlimited Favorites</p>
                    <p className="text-sm text-muted-foreground">Save as many as you want</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="font-medium">Ingredient Encyclopedia</p>
                    <p className="text-sm text-muted-foreground">Learn about ingredients</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
