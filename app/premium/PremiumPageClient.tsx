"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { getPremiumFeatures, FEATURES } from "@/lib/features";
import type { EarlyAdopterStatus } from "@/lib/early-adopter";

export function PremiumPageClient() {
  const { data: session } = useSession();
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [loadingEarlyAdopter, setLoadingEarlyAdopter] = useState(false);
  const [earlyAdopterStatus, setEarlyAdopterStatus] = useState<EarlyAdopterStatus | null>(null);

  useEffect(() => {
    fetch("/api/stripe/early-adopter-status")
      .then((res) => res.json())
      .then(setEarlyAdopterStatus)
      .catch((err) => console.error("Failed to fetch early adopter status:", err));
  }, []);

  const userTier = (session?.user as any)?.tier || "free";
  const isPremium = userTier === "premium";
  const premiumFeatures = getPremiumFeatures();

  const handleCheckout = async (interval: "monthly" | "annual" | "earlyAdopter") => {
    const setLoading =
      interval === "monthly"
        ? setLoadingMonthly
        : interval === "annual"
          ? setLoadingAnnual
          : setLoadingEarlyAdopter;
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interval: interval === "earlyAdopter" ? "monthly" : interval,
          useEarlyAdopter: interval === "earlyAdopter",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-4">
          <PremiumBadge size="lg" />
        </div>
        <h1 className="text-5xl font-bold mb-4" style={{ color: "#0D5F3A" }}>
          Unlock Your Culinary Potential
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get access to AI-powered cooking tools, unlimited recipes, and personalized meal planning
          with MealMuse Premium
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span style={{ color: "#0D5F3A" }}>Free</span>
              </div>
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold" style={{ color: "#0D5F3A" }}>
                $0
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>Browse all recipes</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>Create unlimited recipes</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>Save up to 10 favorites</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>Basic shopping list</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <span>✗</span>
                <span>No AI features</span>
              </li>
            </ul>
            {!isPremium && (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Early Adopter Special */}
        {earlyAdopterStatus?.isEligible && !isPremium && (
          <Card
            className="relative border-2 shadow-xl"
            style={{ borderColor: "#FF6B35", backgroundColor: "rgba(255, 107, 53, 0.02)" }}
          >
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #E84C00 100%)",
                color: "white",
              }}
            >
              🔥 Limited Time - {earlyAdopterStatus.slotsRemaining} Slots Left
            </div>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#0D5F3A" }}>Early Adopter</span>
                  <PremiumBadge size="sm" />
                </div>
              </CardTitle>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" style={{ color: "#FF6B35" }}>
                    $6.99
                  </span>
                  <span className="text-xl text-muted-foreground line-through">$9.99</span>
                </div>
                <span className="text-muted-foreground">/month (forever)</span>
              </div>
              <p className="text-sm font-semibold text-green-600 mt-2">Save 30% permanently</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: "rgba(255, 107, 53, 0.1)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "#FF6B35" }}>
                  ⚡ First 50 users get $6.99/mo forever
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span className="font-medium">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>🤖 AI Chef Chatbot</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>✨ AI Recipe Generator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>❤️ Unlimited Favorites</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span>ℹ️</span>
                  <span>Billed monthly, locked rate never increases</span>
                </li>
              </ul>
              <Button
                onClick={() => handleCheckout("earlyAdopter")}
                disabled={loadingEarlyAdopter}
                className="w-full font-semibold text-lg h-12"
                style={{
                  background: "linear-gradient(135deg, #FF6B35 0%, #E84C00 100%)",
                  color: "white",
                }}
              >
                {loadingEarlyAdopter ? "Loading..." : "Claim Early Adopter Price"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Premium Monthly */}
        <Card
          className="relative border-2 shadow-xl"
          style={{
            borderColor: earlyAdopterStatus?.isEligible ? "#E8A628" : "#0D5F3A",
            backgroundColor: earlyAdopterStatus?.isEligible
              ? "rgba(232, 166, 40, 0.02)"
              : "rgba(13, 95, 58, 0.02)",
          }}
        >
          {!earlyAdopterStatus?.isEligible && (
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #1FA244 0%, #0D5F3A 100%)",
                color: "white",
              }}
            >
              Most Popular
            </div>
          )}
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span style={{ color: "#0D5F3A" }}>Premium Monthly</span>
                <PremiumBadge size="sm" />
              </div>
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold" style={{ color: "#0D5F3A" }}>
                $9.99
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span className="font-medium">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>🤖 AI Chef Chatbot</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>✨ AI Recipe Generator</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>🔄 Recipe Rewriter</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>📅 Meal Planning</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>🛒 AI Shopping Assistant</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>❤️ Unlimited Favorites</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>📚 Ingredient Encyclopedia</span>
              </li>
            </ul>
            {isPremium ? (
              <Button
                variant="outline"
                className="w-full"
                style={{ borderColor: "#0D5F3A", color: "#0D5F3A" }}
                disabled
              >
                Current Plan ✨
              </Button>
            ) : (
              <Button
                onClick={() => handleCheckout("monthly")}
                disabled={loadingMonthly}
                className="w-full font-semibold text-lg h-12"
                style={{
                  background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
                  color: "white",
                }}
              >
                {loadingMonthly ? "Loading..." : "Upgrade to Premium"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Premium Annual */}
        <Card className="relative border-2" style={{ borderColor: "#1FA244" }}>
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: "#1FA244",
              color: "white",
            }}
          >
            Best Value - Save 34%
          </div>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span style={{ color: "#0D5F3A" }}>Premium Annual</span>
                <PremiumBadge size="sm" />
              </div>
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold" style={{ color: "#0D5F3A" }}>
                $79
              </span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#1FA244" }}>
              Save $40.88 per year!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span className="font-medium">All Premium features</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>🤖 AI Chef Chatbot</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>✨ AI Recipe Generator</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>🔄 Recipe Rewriter</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>📅 Meal Planning</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>🛒 AI Shopping Assistant</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>❤️ Unlimited Favorites</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#1FA244" }}>✓</span>
                <span>📚 Ingredient Encyclopedia</span>
              </li>
            </ul>
            {isPremium ? (
              <Button
                variant="outline"
                className="w-full"
                style={{ borderColor: "#1FA244", color: "#1FA244" }}
                disabled
              >
                Active Subscription ✨
              </Button>
            ) : (
              <Button
                onClick={() => handleCheckout("annual")}
                disabled={loadingAnnual}
                className="w-full font-semibold text-lg h-12"
                style={{
                  backgroundColor: "#1FA244",
                  color: "white",
                }}
              >
                {loadingAnnual ? "Loading..." : "Get Annual Plan"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Early Adopter CTA if slots sold out */}
      {earlyAdopterStatus?.isEligible === false && !isPremium && (
        <div className="mb-16 max-w-2xl mx-auto">
          <Card
            className="border-2 p-6"
            style={{ borderColor: "#FF6B35", backgroundColor: "rgba(255, 107, 53, 0.05)" }}
          >
            <p className="text-center text-muted-foreground">
              <span style={{ color: "#FF6B35" }} className="font-semibold">
                Early adopter slots sold out!
              </span>{" "}
              Choose from our regular pricing plans above.
            </p>
          </Card>
        </div>
      )}

      {/* Feature Showcase */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#0D5F3A" }}>
          Premium Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {premiumFeatures.map((key) => {
            const feature = FEATURES[key];
            return (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <span style={{ color: "#0D5F3A" }}>{feature.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#0D5F3A" }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: "#0D5F3A" }}>
                What is the Early Adopter discount?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We're rewarding our first 50 premium subscribers with a special locked-in rate of
                $6.99/month - that's 30% off regular pricing and it never increases. This is our way
                of saying thank you for believing in MealMuse early!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: "#0D5F3A" }}>
                Can I cancel anytime?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can cancel your Premium subscription at any time. You&apos;ll continue to
                have access until the end of your billing period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: "#0D5F3A" }}>
                What happens to my data if I cancel?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All your recipes, favorites, and data are safe. You&apos;ll just lose access to
                premium-only features like AI tools and unlimited favorites.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: "#0D5F3A" }}>
                How does the AI Recipe Generator work?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our AI analyzes your available ingredients, dietary preferences, and cooking skills
                to generate personalized recipes. It uses state-of-the-art language models to create
                unique, practical recipes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: "#0D5F3A" }}>
                Is there a free trial?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We don&apos;t offer a free trial, but you can start with our generous free plan and
                upgrade when you&apos;re ready. Early adopters get an extra 30% discount!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA */}
      {!isPremium && (
        <div className="mt-16 text-center">
          <Card
            className="border-2 p-8"
            style={{
              borderColor: "#E8A628",
              backgroundColor: "rgba(232, 166, 40, 0.05)",
            }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: "#0D5F3A" }}>
              Ready to Transform Your Cooking?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join our early adopters and get AI-powered recipe tools, unlimited favorites, meal
              planning, and so much more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {earlyAdopterStatus?.isEligible && (
                <Button
                  onClick={() => handleCheckout("earlyAdopter")}
                  disabled={loadingEarlyAdopter}
                  size="lg"
                  className="font-semibold text-lg h-14 px-8"
                  style={{
                    background: "linear-gradient(135deg, #FF6B35 0%, #E84C00 100%)",
                    color: "white",
                  }}
                >
                  {loadingEarlyAdopter
                    ? "Loading..."
                    : `🔥 Claim $6.99/mo - ${earlyAdopterStatus?.slotsRemaining} Left`}
                </Button>
              )}
              <Button
                onClick={() => handleCheckout("annual")}
                disabled={loadingAnnual}
                size="lg"
                className="font-semibold text-lg h-14 px-8"
                style={{
                  backgroundColor: "#1FA244",
                  color: "white",
                }}
              >
                {loadingAnnual ? "Loading..." : "Save 34% - $79/year"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Cancel anytime. No questions asked.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
