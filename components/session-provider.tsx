"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

function SessionContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add delay to show loading state for better UX
  useEffect(() => {
    if (status === "loading" || !mounted) {
      setShowContent(false);
    } else {
      // Delay showing content by 500ms to allow loading spinner to be visible
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, mounted]);

  // Show loading spinner while checking session status or during delay
  if (!mounted || status === "loading" || !showContent) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionContent>{children}</SessionContent>
    </SessionProvider>
  );
}
