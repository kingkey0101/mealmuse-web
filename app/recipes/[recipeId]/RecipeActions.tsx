"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RecipeActions({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/recipes?recipeId=${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete recipe");
      }

      // Redirect to my recipes page
      router.push("/recipes/my-recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Link href={`/recipes/${recipeId}/edit`} className="flex-1">
        <Button className="w-full" style={{ backgroundColor: "#7A8854", color: "white" }}>
          Edit Recipe
        </Button>
      </Link>
      <Button
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-50"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
