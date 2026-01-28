"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface FormErrors {
  title?: string;
  cuisine?: string;
  skill?: string;
  ingredients?: string;
  steps?: string;
  equipment?: string;
}

export default function RecipeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    title: "",
    cuisine: "",
    skill: "Beginner",
    dietary: [] as string[],
    cookingTime: "",
    ingredients: "",
    steps: "",
    equipment: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Recipe title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.cuisine.trim()) {
      newErrors.cuisine = "Cuisine type is required";
    }

    if (!formData.skill.trim()) {
      newErrors.skill = "Skill level is required";
    }

    if (!formData.ingredients.trim()) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    if (!formData.steps.trim()) {
      newErrors.steps = "At least one step is required";
    }

    if (!formData.equipment.trim()) {
      newErrors.equipment = "At least one equipment item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse arrays from textarea input (one item per line)
      const ingredients = formData.ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const steps = formData.steps
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const equipment = formData.equipment
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const cuisineArray = formData.cuisine
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const payload = {
        title: formData.title,
        cuisine: cuisineArray.length === 1 ? cuisineArray[0] : cuisineArray,
        skill: formData.skill,
        dietary: formData.dietary,
        cookingTime: formData.cookingTime ? parseInt(formData.cookingTime) : null,
        ingredients,
        steps,
        equipment,
      };

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create recipe");
      }

      const data = await response.json();

      // Redirect to the new recipe detail page
      router.push(`/recipes/${data.recipeId}`);
    } catch (error) {
      console.error("Error creating recipe:", error);
      setErrors({ title: "Failed to create recipe. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDietaryChange = (dietary: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(dietary)
        ? prev.dietary.filter((d) => d !== dietary)
        : [...prev.dietary, dietary],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <Link href="/recipes">
          <Button
            variant="ghost"
            className="gap-2 pl-2 mb-4 hover:bg-transparent"
            style={{ color: "#0D5F3A" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to recipes
          </Button>
        </Link>

        <h1 className="text-4xl font-bold" style={{ color: "#0D5F3A" }}>
          Create New Recipe
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share your culinary creation with the MealMuse community
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg" style={{ backgroundColor: "#E5D1DA" }}>
        <CardHeader className="border-b" style={{ borderColor: "#A28F7A" }}>
          <CardTitle style={{ color: "#0D5F3A" }}>Recipe Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Label htmlFor="title" style={{ color: "#7A8854" }}>
                Recipe Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Classic Italian Carbonara"
                className={`mt-1.5 ${
                  errors.title ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.title}
                </motion.p>
              )}
            </motion.div>

            {/* Cuisine Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Label htmlFor="cuisine" style={{ color: "#7A8854" }}>
                Cuisine Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cuisine"
                value={formData.cuisine}
                onChange={(e) => handleInputChange("cuisine", e.target.value)}
                placeholder="e.g., Italian, Mexican (comma-separated for multiple)"
                className={`mt-1.5 ${
                  errors.cuisine ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.cuisine && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.cuisine}
                </motion.p>
              )}
            </motion.div>

            {/* Skill Level Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Label htmlFor="skill" style={{ color: "#7A8854" }}>
                Skill Level <span className="text-red-500">*</span>
              </Label>
              <select
                id="skill"
                value={formData.skill}
                onChange={(e) => handleInputChange("skill", e.target.value)}
                className={`mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.skill ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.skill && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.skill}
                </motion.p>
              )}
            </motion.div>

            {/* Dietary Preferences Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Label style={{ color: "#7A8854" }}>Dietary Preferences (Optional)</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"].map(
                  (diet) => (
                    <label
                      key={diet}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.dietary.includes(diet)}
                        onChange={() => handleDietaryChange(diet)}
                        className="w-4 h-4 rounded border-2 cursor-pointer"
                        style={{
                          accentColor: "#7A8854",
                          borderColor: "#A28F7A",
                        }}
                      />
                      <span className="text-sm">{diet}</span>
                    </label>
                  )
                )}
              </div>
            </motion.div>

            {/* Cooking Time Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.38 }}
            >
              <Label htmlFor="cookingTime" style={{ color: "#7A8854" }}>
                Cooking Time (Optional)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Estimated time in minutes</p>
              <Input
                id="cookingTime"
                type="number"
                min="1"
                value={formData.cookingTime}
                onChange={(e) => handleInputChange("cookingTime", e.target.value)}
                placeholder="e.g., 45"
                className="mt-1.5"
              />
            </motion.div>

            {/* Ingredients Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Label htmlFor="ingredients" style={{ color: "#7A8854" }}>
                Ingredients <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Enter one ingredient per line</p>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => handleInputChange("ingredients", e.target.value)}
                placeholder="2 cups all-purpose flour&#10;1 cup sugar&#10;3 large eggs"
                rows={6}
                className={`mt-1.5 ${
                  errors.ingredients ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.ingredients && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.ingredients}
                </motion.p>
              )}
            </motion.div>

            {/* Steps Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Label htmlFor="steps" style={{ color: "#7A8854" }}>
                Cooking Steps <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Enter one step per line</p>
              <Textarea
                id="steps"
                value={formData.steps}
                onChange={(e) => handleInputChange("steps", e.target.value)}
                placeholder="Preheat oven to 350°F&#10;Mix dry ingredients in a large bowl&#10;Add wet ingredients and stir until combined"
                rows={8}
                className={`mt-1.5 ${
                  errors.steps ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.steps && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.steps}
                </motion.p>
              )}
            </motion.div>

            {/* Equipment Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Label htmlFor="equipment" style={{ color: "#7A8854" }}>
                Equipment Needed <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Enter one item per line</p>
              <Textarea
                id="equipment"
                value={formData.equipment}
                onChange={(e) => handleInputChange("equipment", e.target.value)}
                placeholder="Large mixing bowl&#10;Whisk&#10;9-inch baking pan"
                rows={5}
                className={`mt-1.5 ${
                  errors.equipment ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.equipment && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.equipment}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex gap-4 pt-4"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-white font-semibold"
                style={{ backgroundColor: "#E8A628" }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Recipe...
                  </>
                ) : (
                  "Create Recipe"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/recipes")}
                disabled={isSubmitting}
                style={{ borderColor: "#A28F7A" }}
              >
                Cancel
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
