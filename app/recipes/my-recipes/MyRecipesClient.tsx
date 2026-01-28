"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Get emoji for recipe based on title
const getRecipeEmoji = (recipe: any) => {
  const title = recipe.title.toLowerCase();

  if (title.includes("omelette") || title.includes("omelet") || title.includes("egg")) return "🍳";
  if (title.includes("bulgogi") || title.includes("stir fry") || title.includes("stir-fry"))
    return "🥘";
  if (title.includes("salad")) return "🥗";
  if (title.includes("bbq") || title.includes("chicken")) return "🍗";
  if (title.includes("falafel")) return "🧆";
  if (title.includes("wrap") && !title.includes("falafel")) return "🌯";
  if (title.includes("shakshuka")) return "🍅";
  if (title.includes("veggie") || title.includes("vegetable")) return "🥬";
  if (title.includes("ramen") || title.includes("noodle")) return "🍜";
  if (title.includes("salmon")) return "🍣";
  if (title.includes("fish") || title.includes("tuna") || title.includes("seafood")) return "🐟";
  if (title.includes("pasta")) return "🍝";
  if (title.includes("pizza")) return "🍕";
  if (title.includes("burger")) return "🍔";
  if (title.includes("taco") || title.includes("burrito")) return "🌮";
  if (title.includes("sushi")) return "🍱";
  if (title.includes("curry")) return "🍛";

  const cuisines = Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine];
  const cuisine = cuisines[0]?.toLowerCase() || "general";

  const emojis: Record<string, string> = {
    italian: "🍝",
    mexican: "🌮",
    japanese: "🍱",
    indian: "🍛",
    french: "🥐",
    american: "🍔",
    default: "🍳",
  };

  return emojis[cuisine] || emojis["default"];
};

// Get gradient based on cuisine
const getRecipeGradient = (recipe: any) => {
  const cuisines = Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine];
  const cuisine = cuisines[0]?.toLowerCase() || "general";

  const gradients: Record<string, string> = {
    italian: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
    mexican: "linear-gradient(135deg, #F39C12 0%, #E67E22 100%)",
    japanese: "linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)",
    indian: "linear-gradient(135deg, #F39C12 0%, #D68910 100%)",
    french: "linear-gradient(135deg, #5F6F81 0%, #34495E 100%)",
    american: "linear-gradient(135deg, #3498DB 0%, #2980B9 100%)",
    default: "linear-gradient(135deg, #7A8854 0%, #5A6844 100%)",
  };

  return gradients[cuisine] || gradients["default"];
};

export default function MyRecipesClient() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    // Fetch only recipes created by this user
    fetch(`/api/recipes/my-recipes`)
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data.recipes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching my recipes:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [session]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Error loading recipes</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">📝</div>
          <h3 className="text-2xl font-semibold mb-3" style={{ color: "#0D5F3A" }}>
            No Recipes Yet
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You haven&apos;t created any recipes yet. Start sharing your culinary creations with the
            community!
          </p>
          <Link href="/recipes/new">
            <Button className="text-white font-semibold" style={{ backgroundColor: "#E8A628" }}>
              Create Your First Recipe
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link
            href={`/recipes/${recipe._id}`}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-xl block"
          >
            <Card
              className="h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group-focus-visible:shadow-lg relative overflow-hidden border-2"
              style={{ borderColor: "#A28F7A" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7A8854";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#A28F7A";
              }}
            >
              {/* Gradient Background with Emoji */}
              <div
                className="relative w-full h-48 overflow-hidden flex items-center justify-center"
                style={{ background: getRecipeGradient(recipe) }}
              >
                <div className="text-8xl opacity-90 transform group-hover:scale-110 transition-transform duration-300">
                  {getRecipeEmoji(recipe)}
                </div>

                {/* "Mine" Badge */}
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                  style={{ backgroundColor: "#7A8854", color: "white" }}
                >
                  My Recipe
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3
                  className="text-xl font-bold mb-2 group-hover:underline line-clamp-2"
                  style={{ color: "#0D5F3A" }}
                >
                  {recipe.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      style={{ color: "#7A8854" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {Array.isArray(recipe.cuisine) ? recipe.cuisine.join(", ") : recipe.cuisine}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      style={{ color: "#7A8854" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>{recipe.skill}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span style={{ color: "#7A8854" }} className="font-medium">
                    {recipe.ingredients?.length || 0} ingredients
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span style={{ color: "#7A8854" }} className="font-medium">
                    {recipe.steps?.length || 0} steps
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
