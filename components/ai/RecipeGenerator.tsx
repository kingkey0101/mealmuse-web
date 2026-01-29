"use client";

import { useState } from "react";
import { useRecipeGenerator } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface RecipeGeneratorProps {
  onRecipeGenerated?: (recipe: string) => void;
}

export function RecipeGenerator({ onRecipeGenerated }: RecipeGeneratorProps) {
  const { generateRecipe, loading, error } = useRecipeGenerator();
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb"];

  const handleToggleDietary = (option: string) => {
    setDietary((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option]
    );
  };

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      setLocalError("Please enter at least one ingredient");
      return;
    }

    setLocalError(null);
    const recipe = await generateRecipe(ingredients, cuisine || undefined, dietary);

    if (!recipe) {
      setLocalError(error || "Failed to generate recipe");
      return;
    }

    setGeneratedRecipe(recipe);
    onRecipeGenerated?.(recipe);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2" style={{ borderColor: "#E8A628" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#0D5F3A" }}>
          ✨ AI Recipe Generator
        </h3>

        {/* Ingredients Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ingredients (comma-separated)</label>
          <Textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., chicken, garlic, soy sauce, ginger, rice"
            className="min-h-24"
            disabled={loading}
          />
        </div>

        {/* Cuisine Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Cuisine Type (Optional)</label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            disabled={loading}
          >
            <option value="">Any Cuisine</option>
            <option value="Italian">Italian</option>
            <option value="Asian">Asian</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="French">French</option>
            <option value="American">American</option>
          </select>
        </div>

        {/* Dietary Preferences */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Dietary Preferences</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dietaryOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleToggleDietary(option)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  dietary.includes(option)
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={dietary.includes(option) ? { backgroundColor: "#0D5F3A" } : {}}
              >
                {option}
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

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={loading || !ingredients.trim()}
          className="w-full py-3 font-semibold text-white rounded-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: loading ? "#ccc" : "#E8A628", color: "#1A1A1A" }}
        >
          {loading ? "Generating Recipe..." : "Generate AI Recipe"}
        </Button>
      </Card>

      {/* Generated Recipe Display */}
      {generatedRecipe && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            Your AI-Generated Recipe
          </h4>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{generatedRecipe}</p>
          </div>
          <div className="mt-6 pt-4 border-t flex gap-2">
            <Button
              onClick={() => onRecipeGenerated?.(generatedRecipe)}
              className="flex-1"
              style={{ backgroundColor: "#0D5F3A", color: "#fff" }}
            >
              Use This Recipe
            </Button>
            <Button
              onClick={() => setGeneratedRecipe(null)}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Generate Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
