"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function FavoritesClient() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const removeFavorite = async (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fetch(`/api/favorites?recipeId=${recipeId}`, {
        method: "DELETE",
      });
      
      // Remove from local state
      setFavoriteRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  useEffect(() => {
    // Fetch favorites and then fetch full recipe details
    fetch("/api/favorites")
      .then(res => res.json())
      .then(async (data) => {
        const favoriteIds = data.favorites || [];
        
        if (favoriteIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all recipes
        const allRecipes = await api("/recipes");
        
        // Filter to only favorites
        const favorites = allRecipes.filter((recipe: any) => 
          favoriteIds.includes(recipe._id)
        );
        
        setFavoriteRecipes(favorites);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching favorites:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-3 pb-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-lg font-semibold text-destructive">Error loading favorites</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (favoriteRecipes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div 
            className="mx-auto h-20 w-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(122, 136, 84, 0.1)" }}
          >
            <svg
              className="h-10 w-10"
              style={{ color: "#7A8854" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">No favorites yet</h3>
          <p className="text-muted-foreground">
            Start exploring recipes and click the heart icon to save your favorites here.
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#7A8854" }}
          >
            Browse Recipes
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favoriteRecipes.map((recipe, index) => (
        <motion.div
          key={recipe._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link
            href={`/recipes/${recipe._id}`}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl block"
          >
            <Card 
              className="h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group-focus-visible:shadow-lg relative overflow-hidden"
              style={{ 
                borderColor: "#7A8854",
                borderWidth: "2px"
              }}
            >
              {/* Remove Favorite Button */}
              <button
                onClick={(e) => removeFavorite(recipe._id, e)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full transition-all hover:scale-110 shadow-md"
                style={{ 
                  backgroundColor: "#7A8854"
                }}
              >
                <svg 
                  className="h-5 w-5 transition-all" 
                  style={{ color: "#FFFFFF" }}
                  fill="currentColor"
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <CardHeader className="space-y-3 pb-4 pt-6">
                <CardTitle 
                  className="text-xl leading-tight transition-colors pr-10"
                  style={{ color: "#2D2D2D" }}
                >
                  {recipe.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span 
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
                    style={{ backgroundColor: "#E5D1DA", color: "#2D2D2D" }}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {Array.isArray(recipe.cuisine) ? recipe.cuisine[0] : recipe.cuisine}
                  </span>
                  <span 
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
                    style={{ backgroundColor: "rgba(232, 166, 40, 0.2)", color: "#2D2D2D" }}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {recipe.skill}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
