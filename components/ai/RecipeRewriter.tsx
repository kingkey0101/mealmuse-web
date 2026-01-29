"use client";

import { useState } from "react";
import { useRecipeRewriter } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecipeRewriterProps {
  recipe: string;
  onRecipeRewritten?: (recipe: string) => void;
}

const cookingStyles = ["Quick & Easy", "Slow Cooker", "Grill", "Baked", "Air Fryer", "One Pot"];

const skillLevels = ["Beginner", "Intermediate", "Advanced"];

export function RecipeRewriter({ recipe, onRecipeRewritten }: RecipeRewriterProps) {
  const { rewriteRecipe, loading, error } = useRecipeRewriter();
  const [style, setStyle] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<string>("");
  const [rewrittenRecipe, setRewrittenRecipe] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRewrite = async () => {
    if (!style || !skillLevel) {
      setLocalError("Please select both style and skill level");
      return;
    }

    setLocalError(null);
    const result = await rewriteRecipe(recipe, style, skillLevel);

    if (!result) {
      setLocalError(error || "Failed to rewrite recipe");
      return;
    }

    setRewrittenRecipe(result);
    onRecipeRewritten?.(result);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-2" style={{ borderColor: "#E8A628" }}>
        <h3
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "#0D5F3A" }}
        >
          ✨ Adapt This Recipe
        </h3>

        {/* Cooking Style */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-3">Cooking Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cookingStyles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  style === s ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={style === s ? { backgroundColor: "#0D5F3A" } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Skill Level</label>
          <div className="grid grid-cols-3 gap-2">
            {skillLevels.map((level) => (
              <button
                key={level}
                onClick={() => setSkillLevel(level)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  skillLevel === level
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={skillLevel === level ? { backgroundColor: "#0D5F3A" } : {}}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {localError}
          </div>
        )}

        {/* Rewrite Button */}
        <Button
          onClick={handleRewrite}
          disabled={loading || !style || !skillLevel}
          className="w-full py-3 font-semibold text-white rounded-lg hover:opacity-90 transition-all"
          style={{
            backgroundColor: loading || !style || !skillLevel ? "#ccc" : "#E8A628",
            color: "#1A1A1A",
          }}
        >
          {loading ? "Rewriting..." : "Adapt Recipe"}
        </Button>
      </Card>

      {/* Rewritten Recipe Display */}
      {rewrittenRecipe && (
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">👨‍🍳</span>
            Adapted Recipe
          </h4>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{rewrittenRecipe}</p>
          </div>
          <div className="mt-6 pt-4 border-t flex gap-2">
            <Button
              onClick={() => onRecipeRewritten?.(rewrittenRecipe)}
              className="flex-1"
              style={{ backgroundColor: "#0D5F3A", color: "#fff" }}
            >
              Accept Adaptation
            </Button>
            <Button
              onClick={() => setRewrittenRecipe(null)}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
