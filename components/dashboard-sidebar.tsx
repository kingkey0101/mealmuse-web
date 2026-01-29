"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PremiumFeatureBadge } from "./premium/PremiumBadge";

interface SubscriptionData {
  tier?: string;
  status?: string;
  currentPeriodEnd?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "active",
  });
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Fetch real subscription status from server
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
        setSubscription((session?.user as any)?.subscription || { tier: "free", status: "active" });
      } finally {
        setLoadingSubscription(false);
      }
    }

    fetchSubscription();
  }, [session]);

  const userTier = subscription.tier || "free";
  const isPremium = userTier === "premium";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      // Add small delay to ensure session is cleared
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: "All Recipes",
      href: "/recipes",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      name: "My Recipes",
      href: "/recipes/my-recipes",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: "Create Recipe",
      href: "/recipes/new",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: "My Favorites",
      href: "/recipes/favorites",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      name: "Shopping List",
      href: "/shopping-list",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      name: "AI Chef Chat",
      href: "/chat",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      badge: "New",
    },
    {
      name: "Account Settings",
      href: "/account/settings",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0"
      style={{ backgroundColor: "#0D5F3A" }}
    >
      <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <Link href="/recipes" className="flex items-center gap-3 group">
            <img src="/favicon.ico" alt="MealMuse Logo" className="h-10 w-10 drop-shadow-lg" />
            <span className="font-serif text-2xl font-bold" style={{ color: "#E5D1DA" }}>
              MealMuse
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive ? "text-foreground shadow-lg" : "text-white/90 hover:bg-white/10"}
                `}
                style={isActive ? { backgroundColor: "#E5D1DA" } : {}}
              >
                <span className={isActive ? "text-foreground" : "text-white/90"}>{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                {(item as any).premium && !isPremium && <PremiumFeatureBadge />}
              </Link>
            );
          })}
        </nav>

        {/* Premium Upgrade CTA - Desktop */}
        {!isPremium && (
          <div className="px-4 mb-3">
            <Link href="/premium">
              <div
                className="rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                style={{
                  background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <span className="text-white font-bold">Go Premium</span>
                </div>
                <p className="text-white text-xs opacity-90 mb-3">
                  Unlock AI features, unlimited favorites, and more
                </p>
                <button
                  className="w-full bg-white text-sm font-semibold py-2 px-3 rounded-md hover:scale-105 transition-transform"
                  style={{ color: "#E8A628" }}
                >
                  Upgrade Now
                </button>
              </div>
            </Link>
          </div>
        )}

        {/* User Section */}
        <div className="px-4 mt-4">
          <div
            className="p-4 rounded-lg mb-3"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: "#7A8854", color: "#FFFFFF" }}
              >
                {session?.user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-white/70 truncate">{session?.user?.email || ""}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full gap-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: "#E5D1DA", color: "#1A1A1A" }}
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Log Out
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile sidebar toggle button
export function MobileSidebarToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userTier = (session?.user as any)?.tier || "free";
  const isPremium = userTier === "premium";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: "All Recipes",
      href: "/recipes",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      name: "My Recipes",
      href: "/recipes/my-recipes",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: "Create Recipe",
      href: "/recipes/new",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: "My Favorites",
      href: "/recipes/favorites",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      name: "Shopping List",
      href: "/shopping-list",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      name: "AI Chef Chat",
      href: "/chat",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      badge: "New",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "#0D5F3A" }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div
            className="relative flex-1 flex flex-col max-w-xs w-full overflow-y-auto"
            style={{ backgroundColor: "#0D5F3A" }}
          >
            {/* Mobile Sidebar Content */}
            <div className="flex flex-col flex-grow pt-8 pb-4">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <Link
                  href="/recipes"
                  className="flex items-center gap-3 group"
                  onClick={() => setIsOpen(false)}
                >
                  <img
                    src="/favicon.ico"
                    alt="MealMuse Logo"
                    className="h-10 w-10 drop-shadow-lg"
                  />
                  <span className="font-serif text-2xl font-bold" style={{ color: "#E5D1DA" }}>
                    MealMuse
                  </span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                        ${isActive ? "text-foreground shadow-lg" : "text-white/90 hover:bg-white/10"}
                      `}
                      style={isActive ? { backgroundColor: "#E5D1DA" } : {}}
                    >
                      <span className={isActive ? "text-foreground" : "text-white/90"}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span
                          className="px-2 py-0.5 text-xs font-semibold rounded-full"
                          style={{ backgroundColor: "#E8A628", color: "#1A1A1A" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="px-4 mt-4">
                <div
                  className="p-4 rounded-lg mb-3"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: "#7A8854", color: "#FFFFFF" }}
                    >
                      {session?.user?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session?.user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-white/70 truncate">{session?.user?.email || ""}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full gap-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: "#E5D1DA", color: "#1A1A1A" }}
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging out...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Log Out
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
