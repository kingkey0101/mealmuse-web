"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SubscriptionData {
  tier?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface UserProfile {
  name?: string;
  phoneNumber?: string;
}

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [managingPortal, setManagingPortal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({ name: "", phoneNumber: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

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

    async function fetchProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            name: data.name || "",
            phoneNumber: data.phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }

    fetchSubscription();
    fetchProfile();
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

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage("");
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setProfileMessage("Profile updated successfully!");
        setIsEditingProfile(false);
        setTimeout(() => setProfileMessage(""), 3000);
      } else {
        const error = await response.json();
        setProfileMessage(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setProfileMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle style={{ color: "#0D5F3A" }}>Account Information</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true))}
            disabled={isSavingProfile}
            style={
              isEditingProfile ? { backgroundColor: "#0D5F3A", color: "white", border: "none" } : {}
            }
          >
            {isSavingProfile ? "Saving..." : isEditingProfile ? "Save Changes" : "Edit Profile"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileMessage && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: profileMessage.includes("success")
                  ? "rgba(31, 162, 68, 0.1)"
                  : "rgba(220, 38, 38, 0.1)",
                color: profileMessage.includes("success") ? "#1FA244" : "#DC2626",
              }}
            >
              {profileMessage}
            </div>
          )}

          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name || ""}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phoneNumber || ""}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  placeholder="Enter your phone number"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <Input type="email" value={userEmail} disabled className="mt-2 bg-gray-100" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
            </div>
          ) : (
            <>
              {profileData.name && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="text-lg font-medium">{profileData.name}</p>
                </div>
              )}
              {profileData.phoneNumber && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="text-lg font-medium">{profileData.phoneNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="text-lg font-medium">{userEmail}</p>
              </div>
              {!profileData.name && !profileData.phoneNumber && (
                <p className="text-sm text-muted-foreground italic">
                  No profile information set. Click Edit Profile to add your details.
                </p>
              )}
            </>
          )}
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
