"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Recipe {
  _id: string;
  title: string;
  cuisine: string | string[];
  skill: string;
  ingredients: string[];
  steps: string[];
  userId: string;
  userEmail?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  feedback?: string;
}

export default function AdminApprovalsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  async function fetchPendingRecipes() {
    try {
      const response = await fetch("/api/admin/recipes/pending");
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending recipes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(recipeId: string) {
    setProcessingId(recipeId);
    try {
      const response = await fetch("/api/admin/recipes/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          status: "approved",
          feedback: feedback[recipeId] || "",
        }),
      });

      if (response.ok) {
        setRecipes(recipes.filter((r) => r._id !== recipeId));
      }
    } catch (error) {
      console.error("Failed to approve recipe:", error);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(recipeId: string) {
    setProcessingId(recipeId);
    try {
      const response = await fetch("/api/admin/recipes/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          status: "rejected",
          feedback: feedback[recipeId] || "Recipe does not meet our guidelines.",
        }),
      });

      if (response.ok) {
        setRecipes(recipes.filter((r) => r._id !== recipeId));
      }
    } catch (error) {
      console.error("Failed to reject recipe:", error);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "#0D5F3A" }}>
            Recipe Approvals
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and approve user-submitted recipes ({recipes.length} pending)
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading pending recipes...</p>
        ) : recipes.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium" style={{ color: "#0D5F3A" }}>
                ✨ No pending recipes!
              </p>
              <p className="text-muted-foreground mt-2">
                All submitted recipes have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg overflow-hidden" style={{ backgroundColor: "#E5D1DA" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2" style={{ color: "#0D5F3A" }}>
                          {recipe.title}
                        </CardTitle>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>👨‍🍳 {recipe.skill}</span>
                          <span>
                            🍽️{" "}
                            {Array.isArray(recipe.cuisine)
                              ? recipe.cuisine.join(", ")
                              : recipe.cuisine}
                          </span>
                          <span>📅 {new Date(recipe.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "rgba(255, 193, 7, 0.2)", color: "#FFC107" }}
                      >
                        Pending
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: "#0D5F3A" }}>
                          Ingredients ({recipe.ingredients.length})
                        </h4>
                        <ul className="text-sm space-y-1">
                          {recipe.ingredients.slice(0, 5).map((ing, i) => (
                            <li key={i} className="text-muted-foreground">
                              • {ing}
                            </li>
                          ))}
                          {recipe.ingredients.length > 5 && (
                            <li className="text-muted-foreground">
                              • +{recipe.ingredients.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: "#0D5F3A" }}>
                          Steps ({recipe.steps.length})
                        </h4>
                        <ul className="text-sm space-y-1">
                          {recipe.steps.slice(0, 3).map((step, i) => (
                            <li key={i} className="text-muted-foreground line-clamp-1">
                              {i + 1}. {step}
                            </li>
                          ))}
                          {recipe.steps.length > 3 && (
                            <li className="text-muted-foreground">
                              +{recipe.steps.length - 3} more steps
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <label
                        className="text-sm font-medium block mb-2"
                        style={{ color: "#0D5F3A" }}
                      >
                        Feedback (optional):
                      </label>
                      <textarea
                        value={feedback[recipe._id] || ""}
                        onChange={(e) =>
                          setFeedback({
                            ...feedback,
                            [recipe._id]: e.target.value,
                          })
                        }
                        placeholder="Add feedback for the user..."
                        className="w-full p-2 border rounded text-sm"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleApprove(recipe._id)}
                        disabled={processingId === recipe._id}
                        className="flex-1"
                        style={{ backgroundColor: "#1FA244", color: "white" }}
                      >
                        {processingId === recipe._id ? "Processing..." : "✓ Approve"}
                      </Button>
                      <Button
                        onClick={() => handleReject(recipe._id)}
                        disabled={processingId === recipe._id}
                        variant="outline"
                        className="flex-1"
                        style={{ borderColor: "#DC2626", color: "#DC2626" }}
                      >
                        {processingId === recipe._id ? "Processing..." : "✕ Reject"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
