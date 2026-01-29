"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FEATURES, FeatureKey } from "@/lib/features";

interface UpgradePromptProps {
  feature?: FeatureKey;
  reason?: "premium_required" | "limit_reached" | "subscription_inactive";
  compact?: boolean;
}

export function UpgradePrompt({ feature, reason, compact = false }: UpgradePromptProps) {
  const featureData = feature ? FEATURES[feature] : null;

  const getTitle = () => {
    if (reason === "limit_reached") return "Limit Reached";
    if (reason === "subscription_inactive") return "Subscription Required";
    return "Premium Feature";
  };

  const getMessage = () => {
    if (reason === "limit_reached" && featureData) {
      return `You've reached your free limit for ${featureData.name.toLowerCase()}. Upgrade to Premium for unlimited access.`;
    }
    if (reason === "subscription_inactive") {
      return "Your premium subscription is inactive. Please update your payment method to continue.";
    }
    if (featureData) {
      return `${featureData.name} is a Premium feature. Upgrade to unlock this and many more powerful tools.`;
    }
    return "This feature is available for Premium members. Upgrade to unlock all features.";
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 text-sm"
      >
        <span className="text-muted-foreground">{getMessage()}</span>
        <Link href="/premium">
          <Button size="sm" style={{ backgroundColor: "#E8A628", color: "white" }}>
            Upgrade
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="border-2"
        style={{
          borderColor: "#E8A628",
          backgroundColor: "rgba(232, 166, 40, 0.05)",
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {featureData?.icon && <span className="text-2xl">{featureData.icon}</span>}
            <span style={{ color: "#0D5F3A" }}>🔒 {getTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{getMessage()}</p>

          {featureData && (
            <div className="rounded-lg p-4" style={{ backgroundColor: "rgba(122, 136, 84, 0.1)" }}>
              <p className="text-sm font-medium mb-2" style={{ color: "#7A8854" }}>
                Premium includes:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>Unlimited {featureData.name.toLowerCase()}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>All AI-powered features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "#1FA244" }}>✓</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/premium" className="flex-1">
              <Button
                className="w-full font-semibold"
                size="lg"
                style={{
                  background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
                  color: "white",
                }}
              >
                Upgrade to Premium - $9.99/mo
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
