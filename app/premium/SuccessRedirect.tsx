"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Handles redirect from success page to chat
 * Adds a 3-second delay to ensure webhook has processed
 */
export function SuccessRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Give webhook 3 seconds to process the subscription update
    const timer = setTimeout(() => {
      router.push("/chat");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground text-center">
        Redirecting to AI Chef Chat in a moment...
      </p>
      <Link href="/chat" className="flex-1 sm:flex-none">
        <Button
          size="lg"
          className="w-full sm:w-auto font-semibold"
          style={{
            background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
            color: "white",
          }}
        >
          Go to AI Chef Chat Now →
        </Button>
      </Link>
    </div>
  );
}
