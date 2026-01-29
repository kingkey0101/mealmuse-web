/**
 * React hooks for AI features
 * Handles API calls and state management for all AI capabilities
 */

import { useState, useCallback } from "react";

interface AIResponse {
  success: boolean;
  message?: string;
  recipe?: string;
  result?: string;
  error?: string;
}

/**
 * Hook for AI Chef chat
 */
export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string, context?: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, context }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to get response from AI Chef");
        }

        const data: AIResponse = await response.json();
        return data.message || null;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendMessage, loading, error };
}

/**
 * Hook for recipe generation
 */
export function useRecipeGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = useCallback(
    async (ingredients: string, cuisine?: string, dietary?: string[]): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/generate-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients, cuisine, dietary }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to generate recipe");
        }

        const data: AIResponse = await response.json();
        return data.recipe || null;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generateRecipe, loading, error };
}

/**
 * Hook for recipe rewriting
 */
export function useRecipeRewriter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewriteRecipe = useCallback(
    async (recipe: string, style: string, skillLevel: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/rewrite-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe, style, skillLevel }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to rewrite recipe");
        }

        const data: AIResponse = await response.json();
        return data.recipe || null;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { rewriteRecipe, loading, error };
}

/**
 * Hook for ingredient analysis
 */
export function useIngredientAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeIngredient = useCallback(
    async (
      ingredient: string,
      type: "explain" | "substitutes" = "explain",
      reason?: string
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredient, type, reason }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to analyze ingredient");
        }

        const data: AIResponse = await response.json();
        return data.result || null;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { analyzeIngredient, loading, error };
}
