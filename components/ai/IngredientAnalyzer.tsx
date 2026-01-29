"use client";

import { useState } from "react";
import { useIngredientAnalysis } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface IngredientAnalyzerProps {
  ingredient?: string;
}

export function IngredientAnalyzer({ ingredient: initialIngredient }: IngredientAnalyzerProps) {
  const { analyzeIngredient, loading, error } = useIngredientAnalysis();
  const [ingredient, setIngredient] = useState(initialIngredient || "");
  const [type, setType] = useState<"explain" | "substitutes">("explain");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!ingredient.trim()) {
      setLocalError("Please enter an ingredient name");
      return;
    }

    setLocalError(null);
    const analysisResult = await analyzeIngredient(ingredient, type, reason || undefined);

    if (!analysisResult) {
      setLocalError(error || "Failed to analyze ingredient");
      return;
    }

    setResult(analysisResult);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && ingredient.trim()) {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">🥕</span>
          Ingredient Assistant
        </h3>

        {/* Ingredient Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ingredient Name</label>
          <Input
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., olive oil, butter, tofu..."
            disabled={loading}
          />
        </div>

        {/* Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What do you need?</label>
          <div className="flex gap-2">
            <button
              onClick={() => setType("explain")}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                type === "explain" ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={type === "explain" ? { backgroundColor: "#0D5F3A" } : {}}
            >
              Learn About It
            </button>
            <button
              onClick={() => setType("substitutes")}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                type === "substitutes"
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={type === "substitutes" ? { backgroundColor: "#0D5F3A" } : {}}
            >
              Find Substitutes
            </button>
          </div>
        </div>

        {/* Reason (for substitutes) */}
        {type === "substitutes" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Why? (Optional)</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., allergic, out of stock, prefer healthier..."
              disabled={loading}
            />
          </div>
        )}

        {/* Error Message */}
        {localError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {localError}
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={loading || !ingredient.trim()}
          className="w-full py-3 font-semibold text-white rounded-lg hover:opacity-90 transition-all"
          style={{
            backgroundColor: loading || !ingredient.trim() ? "#ccc" : "#E8A628",
            color: "#1A1A1A",
          }}
        >
          {loading ? "Analyzing..." : "Get Info"}
        </Button>
      </Card>

      {/* Result Display */}
      {result && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">{type === "explain" ? "📚" : "🔄"}</span>
            {type === "explain" ? "About" : "Substitutes for"} {ingredient}
          </h4>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{result}</p>
          </div>
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={() => setResult(null)}
              className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Analyze Another Ingredient
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
