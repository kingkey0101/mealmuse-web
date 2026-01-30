"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRecipeGenerator } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface RecipeGeneratorProps {
  onRecipeGenerated?: (recipe: string) => void;
}

export function RecipeGenerator({ onRecipeGenerated }: RecipeGeneratorProps) {
  const router = useRouter();
  const { generateRecipe, loading, error } = useRecipeGenerator();
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null);
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<{
    interactionId?: string;
    conversationId?: string;
    extractedTags?: string[];
    model?: string;
    prompt?: string;
    searchIntent?: {
      cuisine?: string;
      diet?: string;
      skill?: string;
      cookingTime?: number;
    };
  } | null>(null);

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
    setSavedRecipeId(null);
    const result = await generateRecipe(ingredients, cuisine || undefined, dietary);

    if (!result?.recipe) {
      setLocalError(error || "Failed to generate recipe");
      return;
    }

    setGeneratedRecipe(result.recipe);
    setGenerationMeta({
      interactionId: result.interactionId,
      conversationId: result.conversationId,
      extractedTags: result.extractedTags,
      model: result.model,
      prompt: result.prompt,
      searchIntent: result.searchIntent,
    });
    onRecipeGenerated?.(result.recipe);
  };

  const parseRecipeText = (recipeText: string) => {
    const lines = recipeText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const titleLine = lines.find((line) => /recipe title|^title[:\s]/i.test(line)) || lines[0];
    const title = titleLine
      ? titleLine
          .replace(/recipe title[:\s-]*/i, "")
          .replace(/^title[:\s-]*/i, "")
          .trim()
      : "AI Generated Recipe";

    const ingredientsStart = lines.findIndex((line) => /^ingredients?[:\s]/i.test(line));
    const stepsStart = lines.findIndex((line) =>
      /(^instructions?|^steps?|^directions?)[:\s]/i.test(line)
    );

    let ingredientsList: string[] = [];
    let stepsList: string[] = [];

    if (ingredientsStart !== -1) {
      const ingredientsEnd = stepsStart !== -1 ? stepsStart : lines.length;
      ingredientsList = lines
        .slice(ingredientsStart + 1, ingredientsEnd)
        .map((line) => line.replace(/^[-*\d\.]+\s*/, "").trim())
        .filter((line) => line && !/(^instructions?|^steps?|^directions?)[:\s]/i.test(line));
    }

    if (stepsStart !== -1) {
      stepsList = lines
        .slice(stepsStart + 1)
        .map((line) => line.replace(/^[-*\d\.]+\s*/, "").trim())
        .filter((line) => line && !/(^tips?|^notes?)[:\s]/i.test(line));
    }

    if (ingredientsList.length === 0) {
      ingredientsList = lines
        .filter(
          (line) =>
            /^[-*]/.test(line) &&
            !/(instructions?|steps?|directions?|tips?|notes?|servings?|cooking time|prep time)/i.test(
              line
            )
        )
        .map((line) => line.replace(/^[-*]+\s*/, "").trim());
    }

    if (stepsList.length === 0) {
      const numberedSteps = lines
        .filter((line) => /^\d+\./.test(line))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim());

      stepsList =
        numberedSteps.length > 0
          ? numberedSteps
          : lines.filter(
              (line) =>
                !/^(ingredients?|instructions?|steps?|directions?|tips?|notes?|servings?|cooking time|prep time)[:\s]/i.test(
                  line
                )
            );
    }

    return { title, ingredientsList, stepsList };
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    setIsSaving(true);
    setLocalError(null);

    try {
      const { title, ingredientsList, stepsList } = parseRecipeText(generatedRecipe);

      // Save to database via API
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          cuisine: cuisine || "General",
          skill: "Intermediate",
          dietary: dietary,
          cookingTime: null,
          ingredients:
            ingredientsList.length > 0
              ? ingredientsList
              : ["See recipe text above for ingredients"],
          steps: stepsList.length > 0 ? stepsList : ["See recipe text above for instructions"],
          equipment: ["See recipe for equipment needs"],
          source: "ai_generated",
          generatedByAI: generationMeta
            ? {
                prompt: generationMeta.prompt,
                extractedTags: generationMeta.extractedTags || [],
                model: generationMeta.model || "llama-3.1-8b-instant",
                conversationId: generationMeta.conversationId,
              }
            : undefined,
          aiInteractionId: generationMeta?.interactionId,
          searchIntent: generationMeta?.searchIntent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save recipe");
      }

      const data = await response.json();
      setSavedRecipeId(data.recipeId);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
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

          {savedRecipeId ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              ✓ Saved to My Recipes!{" "}
              <Link
                href={`/recipes/${savedRecipeId}`}
                className="font-semibold underline underline-offset-2"
              >
                View recipe
              </Link>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={handleSaveRecipe}
                disabled={isSaving}
                className="w-full font-semibold"
                style={{ backgroundColor: "#0D5F3A", color: "#fff" }}
              >
                {isSaving ? "Saving..." : "💾 Save to My Recipes"}
              </Button>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => onRecipeGenerated?.(generatedRecipe)}
              className="flex-1"
              style={{ backgroundColor: "#7A8854", color: "#fff" }}
            >
              Use This Recipe
            </Button>
            <Button
              onClick={() => {
                setGeneratedRecipe(null);
                setSavedRecipeId(null);
              }}
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
