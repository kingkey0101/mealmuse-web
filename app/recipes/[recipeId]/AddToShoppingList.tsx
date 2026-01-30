"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AddToShoppingList({ ingredients }: { ingredients: string[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState<number | null>(null);

  const normalizedIngredients = useMemo(() => {
    return Array.from(
      new Set(
        (ingredients || [])
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
          .filter((item) => !/^(tips?|notes?|servings?|cooking time|prep time)[:\s]/i.test(item))
      )
    );
  }, [ingredients]);

  // Parse ingredient string to extract quantity, unit, and name
  const parseIngredient = (ingredient: string) => {
    // Match patterns like "2 cups flour", "1/2 teaspoon salt", "3-4 apples"
    const match = ingredient.match(/^([\d\s\/.,-]+)?\s*([a-zA-Z]+)?\s*(.+)$/);

    if (match) {
      const quantityStr = match[1]?.trim() || "";
      const unit = match[2]?.trim() || "";
      const name = match[3]?.trim() || ingredient;

      // Parse quantity (handle fractions like "1/2", ranges like "3-4", decimals)
      let quantity = 1;
      if (quantityStr) {
        if (quantityStr.includes("/")) {
          // Handle fractions like "1/2"
          const parts = quantityStr.split("/");
          quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else if (quantityStr.includes("-")) {
          // Handle ranges like "3-4" - use the first number
          quantity = parseFloat(quantityStr.split("-")[0]);
        } else {
          quantity = parseFloat(quantityStr) || 1;
        }
      }

      return { name, quantity, unit };
    }

    // If no match, return the whole string as name
    return { name: ingredient, quantity: 1, unit: "" };
  };

  const handleAddAll = async () => {
    if (normalizedIngredients.length === 0) return;

    setIsAdding(true);
    setError(null);
    setAddedCount(null);

    try {
      for (const item of normalizedIngredients) {
        const parsedItem = parseIngredient(item);

        const response = await fetch("/api/shopping-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: parsedItem }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add item");
        }
      }

      setAddedCount(normalizedIngredients.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add items");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          onClick={handleAddAll}
          disabled={isAdding || normalizedIngredients.length === 0}
          className="w-full flex items-center justify-center gap-2 whitespace-normal text-center"
          style={{ backgroundColor: "#0D5F3A", color: "white" }}
        >
          {isAdding ? "Adding..." : "🛒 Add Ingredients to Shopping List"}
        </Button>
        <Link href="/shopping-list" className="w-full">
          <Button
            variant="outline"
            className="w-full border-2"
            style={{ borderColor: "#7A8854", color: "#7A8854" }}
          >
            View Shopping List
          </Button>
        </Link>
      </div>

      {addedCount !== null && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Added {addedCount} item{addedCount === 1 ? "" : "s"} to your shopping list.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
