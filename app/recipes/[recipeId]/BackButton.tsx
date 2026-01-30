"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const target = `/recipes?page=${pageParam}`;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mealmuse:return-to-recipes", target);
      }
      router.push(target);
      return;
    }

    const returnTo =
      typeof window !== "undefined" ? sessionStorage.getItem("mealmuse:return-to-recipes") : null;

    if (returnTo) {
      router.push(returnTo);
      return;
    }

    router.back();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="gap-2 pl-2 hover:bg-gray-100 text-sm sm:text-base cursor-pointer transition-colors"
      style={{ color: "#0D5F3A" }}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to recipes
    </Button>
  );
}
