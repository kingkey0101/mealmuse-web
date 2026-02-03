"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const RECIPES_PER_PAGE = 9;

const SKILL_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];
const DIETARY_PREFERENCES = [
  "All",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
];
const COOKING_TIMES = ["All", "Under 30 min", "30-60 min", "Over 60 min"];

export default function RecipesClient({ initialPage = 1 }: { initialPage?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didMountRef = useRef(false);
  const prevFiltersRef = useRef({
    skillFilter: "All",
    dietaryFilter: "All",
    timeFilter: "All",
  });
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [skillFilter, setSkillFilter] = useState("All");
  const [dietaryFilter, setDietaryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const { data: session } = useSession();

  // Sync current page from URL (supports back/forward and hard refresh)
  useEffect(() => {
    const param = searchParams.get("page");
    const parsed = param ? parseInt(param, 10) : initialPage;
    const nextPage = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("mealmuse:return-to-recipes", `/recipes?page=${nextPage}`);
    }
  }, [searchParams, initialPage, currentPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const param = searchParams.get("page");
    if (param) return;

    const stored = sessionStorage.getItem("mealmuse:return-to-recipes");
    if (stored && stored !== "/recipes?page=1") {
      router.replace(stored, { scroll: false });
    }
  }, [searchParams, router]);

  // Generate gradient background based on cuisine type
  const getRecipeGradient = (recipe: any) => {
    const cuisines = Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine];
    const cuisine = cuisines[0]?.toLowerCase() || "general";

    const gradients: Record<string, string> = {
      italian: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
      mexican: "linear-gradient(135deg, #F39C12 0%, #E67E22 100%)",
      chinese: "linear-gradient(135deg, #E74C3C 0%, #D35400 100%)",
      japanese: "linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)",
      indian: "linear-gradient(135deg, #F39C12 0%, #D68910 100%)",
      thai: "linear-gradient(135deg, #16A085 0%, #1ABC9C 100%)",
      french: "linear-gradient(135deg, #5F6F81 0%, #34495E 100%)",
      american: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
      mediterranean: "linear-gradient(135deg, #3498DB 0%, #2980B9 100%)",
      default: "linear-gradient(135deg, #7A8854 0%, #5A6844 100%)",
    };

    return gradients[cuisine] || gradients["default"];
  };

  // Get emoji for recipe based on title
  const getCuisineEmoji = (recipe: any) => {
    const title = recipe.title.toLowerCase();

    // Match specific food items in recipe titles
    if (title.includes("omelette") || title.includes("omelet") || title.includes("egg"))
      return "🍳";
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
    if (title.includes("pasta") || title.includes("spaghetti") || title.includes("linguine"))
      return "🍝";
    if (title.includes("pizza")) return "🍕";
    if (title.includes("burger")) return "🍔";
    if (title.includes("taco") || title.includes("burrito")) return "🌮";
    if (title.includes("sushi") || title.includes("poke")) return "🍱";
    if (title.includes("curry")) return "🍛";
    if (title.includes("rice")) return "🍚";
    if (title.includes("soup") || title.includes("stew")) return "🍲";
    if (title.includes("steak") || title.includes("beef")) return "🥩";
    if (title.includes("sandwich")) return "🥪";
    if (title.includes("shrimp") || title.includes("prawn")) return "🍤";
    if (title.includes("bread") || title.includes("toast")) return "🍞";
    if (title.includes("cake") || title.includes("dessert")) return "🍰";
    if (title.includes("pie")) return "🥧";
    if (title.includes("pancake") || title.includes("waffle")) return "🥞";
    if (title.includes("coffee") || title.includes("espresso")) return "☕";
    if (title.includes("smoothie") || title.includes("juice")) return "🥤";

    // Fall back to cuisine-based emoji
    const cuisines = Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine];
    const cuisine = cuisines[0]?.toLowerCase() || "general";

    const emojis: Record<string, string> = {
      italian: "🍝",
      mexican: "🌮",
      chinese: "🥢",
      japanese: "🍱",
      indian: "🍛",
      thai: "🌶️",
      french: "🥐",
      american: "🍔",
      mediterranean: "🫒",
      default: "🍳",
    };

    return emojis[cuisine] || emojis["default"];
  };

  // Apply client-side filters
  const filteredRecipes = recipes.filter((recipe) => {
    // Skill filter (case-insensitive)
    if (skillFilter !== "All" && recipe.skill?.toLowerCase() !== skillFilter.toLowerCase()) {
      return false;
    }

    // Dietary filter - must have matching dietary preference (case-insensitive)
    if (dietaryFilter !== "All") {
      const dietary = recipe.dietary || recipe.dietaryPreferences || [];
      // Recipe must have the specific dietary preference in its array (case-insensitive)
      const hasMatch = dietary.some(
        (pref: string) => pref.toLowerCase() === dietaryFilter.toLowerCase()
      );
      if (!hasMatch) {
        return false;
      }
    }

    // Time filter - check cookingTime or readyInMinutes
    if (timeFilter !== "All") {
      const cookTime = recipe.cookingTime || recipe.readyInMinutes || recipe.prepTime;
      // Show recipes without time info when "All" is selected
      // But exclude them when a specific time range is selected
      if (!cookTime || cookTime === 0) {
        return false;
      }
      if (timeFilter === "Under 30 min" && cookTime >= 30) return false;
      if (timeFilter === "30-60 min" && (cookTime < 30 || cookTime > 60)) return false;
      if (timeFilter === "Over 60 min" && cookTime <= 60) return false;
    }

    return true;
  });

  console.log("Filter results:", {
    totalRecipes: recipes.length,
    filteredCount: filteredRecipes.length,
    filters: { skillFilter, dietaryFilter, timeFilter },
    sampleRecipeSkills: recipes.slice(0, 3).map((r) => r.skill),
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);
  const maxPageButtons = 5;
  const halfWindow = Math.floor(maxPageButtons / 2);
  let paginationStart = Math.max(1, currentPage - halfWindow);
  const paginationEnd = Math.min(totalPages, paginationStart + maxPageButtons - 1);
  paginationStart = Math.max(1, paginationEnd - maxPageButtons + 1);

  const updatePage = useCallback(
    (page: number) => {
      const normalized = Math.max(1, page);
      const bounded = totalPages > 0 ? Math.min(totalPages, normalized) : normalized;
      const url = `/recipes?page=${bounded}`;
      setCurrentPage(bounded);
      router.push(url, { scroll: false });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mealmuse:return-to-recipes", url);
      }
    },
    [router, totalPages]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.skillFilter !== skillFilter ||
      prev.dietaryFilter !== dietaryFilter ||
      prev.timeFilter !== timeFilter;

    prevFiltersRef.current = { skillFilter, dietaryFilter, timeFilter };

    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (!filtersChanged) {
      return;
    }

    updatePage(1);
  }, [skillFilter, dietaryFilter, timeFilter, updatePage]);

  const toggleFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setTogglingFavorite(recipeId);

    const isFavorited = favorites.has(recipeId);
    const newFavorites = new Set(favorites);

    // Optimistic UI update
    if (isFavorited) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }
    setFavorites(newFavorites);

    try {
      if (isFavorited) {
        // Remove from favorites
        await fetch(`/api/favorites?recipeId=${recipeId}`, {
          method: "DELETE",
        });
      } else {
        // Add to favorites
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      if (isFavorited) {
        newFavorites.add(recipeId);
      } else {
        newFavorites.delete(recipeId);
      }
      setFavorites(newFavorites);
    } finally {
      setTogglingFavorite(null);
    }
  };

  useEffect(() => {
    console.log("Session:", session);

    // Don't fetch if there's no session (e.g., after logout)
    if (!session) {
      setLoading(false);
      return;
    }

    // Fetch all recipes once (filtering is done client-side)
    Promise.all([
      fetch("/api/recipes").then((res) => res.json()),
      fetch("/api/favorites").then((res) => res.json()),
    ])
      .then(([recipesData, favoritesData]) => {
        console.log("Recipes response:", recipesData);
        console.log("Favorites response:", favoritesData);
        setRecipes(recipesData as any[]);
        setFavorites(new Set(favoritesData.favorites || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [session]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Card key={i} className="h-full border-2" style={{ borderColor: "#A28F7A" }}>
            <div className="w-full h-48 bg-muted animate-pulse" />
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-lg font-semibold text-destructive">Error loading recipes</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">No recipes yet</h3>
          <p className="text-muted-foreground">
            Get started by creating your first recipe and begin your culinary journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Skill Level Filter */}
          <div>
            <label
              className="block text-xs sm:text-sm font-medium mb-2"
              style={{ color: "#7A8854" }}
            >
              Skill Level
            </label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm"
              style={{
                borderColor: "#A28F7A",
              }}
            >
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Preference Filter */}
          <div>
            <label
              className="block text-xs sm:text-sm font-medium mb-2"
              style={{ color: "#7A8854" }}
            >
              Dietary
            </label>
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm"
              style={{
                borderColor: "#A28F7A",
              }}
            >
              {DIETARY_PREFERENCES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>

          {/* Cooking Time Filter */}
          <div>
            <label
              className="block text-xs sm:text-sm font-medium mb-2"
              style={{ color: "#7A8854" }}
            >
              Cooking Time
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm"
              style={{
                borderColor: "#A28F7A",
              }}
            >
              {COOKING_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(skillFilter !== "All" || dietaryFilter !== "All" || timeFilter !== "All") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm text-muted-foreground">Active filters:</span>
            {skillFilter !== "All" && (
              <button
                onClick={() => setSkillFilter("All")}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full flex items-center gap-2 transition-all hover:opacity-80"
                style={{ backgroundColor: "#7A8854", color: "white" }}
              >
                {skillFilter}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {dietaryFilter !== "All" && (
              <button
                onClick={() => setDietaryFilter("All")}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full flex items-center gap-2 transition-all hover:opacity-80"
                style={{ backgroundColor: "#7A8854", color: "white" }}
              >
                {dietaryFilter}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {timeFilter !== "All" && (
              <button
                onClick={() => setTimeFilter("All")}
                className="px-3 py-1 text-sm rounded-full flex items-center gap-2 transition-all hover:opacity-80"
                style={{ backgroundColor: "#7A8854", color: "white" }}
              >
                {timeFilter}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                setSkillFilter("All");
                setDietaryFilter("All");
                setTimeFilter("All");
              }}
              className="text-sm underline"
              style={{ color: "#7A8854" }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRecipes.map((recipe, index) => {
          const isFavorite = favorites.has(recipe._id);
          const isToggling = togglingFavorite === recipe._id;

          return (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/recipes/${recipe._id}?page=${currentPage}`}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(
                      "mealmuse:return-to-recipes",
                      `/recipes?page=${currentPage}`
                    );
                  }
                }}
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-xl block"
                style={{ "--focus-ring-color": "#7A8854" } as any}
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
                      {getCuisineEmoji(recipe)}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(recipe._id, e)}
                      disabled={isToggling}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                      style={{
                        backgroundColor: isFavorite ? "#7A8854" : "rgba(255, 255, 255, 0.95)",
                      }}
                    >
                      <svg
                        className="h-5 w-5 transition-all"
                        style={{ color: isFavorite ? "#FFFFFF" : "#7A8854" }}
                        fill={isFavorite ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  <CardHeader className="space-y-3 pb-4 pt-4">
                    <CardTitle
                      className="text-lg leading-tight transition-colors line-clamp-2"
                      style={{ color: "#2D2D2D" }}
                    >
                      {recipe.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
                        style={{ backgroundColor: "#E8A628", color: "#FFFFFF" }}
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        {recipe.cuisine}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
                        style={{ backgroundColor: "#E8A628", color: "#FFFFFF" }}
                      >
                        <svg
                          className="h-3.5 w-3.5"
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
                        {recipe.skill}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              updatePage(Math.max(1, currentPage - 1));
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.documentElement.scrollTop = 0;
              }, 0);
            }}
            disabled={currentPage === 1}
            className="border-2 disabled:opacity-50"
            style={{
              borderColor: "#A28F7A",
              color: "#2D2D2D",
            }}
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.max(0, paginationEnd - paginationStart + 1) },
              (_, i) => paginationStart + i
            ).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => {
                  updatePage(page);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    document.documentElement.scrollTop = 0;
                  }, 0);
                }}
                className="w-10 h-10 p-0 border-2"
                style={
                  currentPage === page
                    ? { backgroundColor: "#7A8854", borderColor: "#7A8854", color: "#FFFFFF" }
                    : { borderColor: "#A28F7A", color: "#2D2D2D" }
                }
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              updatePage(Math.min(totalPages, currentPage + 1));
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.documentElement.scrollTop = 0;
              }, 0);
            }}
            disabled={currentPage === totalPages}
            className="border-2 disabled:opacity-50"
            style={{
              borderColor: "#A28F7A",
              color: "#2D2D2D",
            }}
          >
            Next
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </>
  );
}
