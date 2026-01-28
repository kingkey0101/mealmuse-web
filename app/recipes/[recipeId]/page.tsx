//
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Recipe {
  _id: string;
  title: string;
  cuisine: string | string[];
  skill: string;
  dietary?: string[];
  cookingTime?: number;
  ingredients: string[];
  steps: string[];
  equipment: string[];
  userId?: string;
}

// Helper function to get emoji for recipe
function getRecipeEmoji(recipe: Recipe) {
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
}

// Helper function to get gradient based on cuisine
function getRecipeGradient(recipe: Recipe) {
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
}

export default async function RecipeDetailPage(props: {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const { recipeId } = await props.params;
  const searchParams = await props.searchParams;
  const page = searchParams.page || "1";
  const recipe = await api<Recipe>(`/recipes/${recipeId}`);

  const isOwner = recipe.userId === session.user.id;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/recipes?page=${page}`}>
            <Button
              variant="ghost"
              className="gap-2 pl-2 hover:bg-transparent"
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
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Metadata */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recipe Image with Emoji */}
            <Card className="overflow-hidden shadow-lg" style={{ backgroundColor: "#E5D1DA" }}>
              <div
                className="relative h-64 flex items-center justify-center"
                style={{ background: getRecipeGradient(recipe) }}
              >
                <div className="text-9xl">{getRecipeEmoji(recipe)}</div>
              </div>
            </Card>

            {/* Metadata Card */}
            <Card className="shadow-lg" style={{ backgroundColor: "#E5D1DA" }}>
              <CardHeader>
                <CardTitle style={{ color: "#0D5F3A" }}>Recipe Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 shrink-0"
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
                    <div>
                      <p className="text-sm text-muted-foreground">Cuisine</p>
                      <p className="font-semibold" style={{ color: "#0D5F3A" }}>
                        {Array.isArray(recipe.cuisine) ? recipe.cuisine.join(", ") : recipe.cuisine}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 shrink-0"
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
                    <div>
                      <p className="text-sm text-muted-foreground">Skill Level</p>
                      <p className="font-semibold" style={{ color: "#0D5F3A" }}>
                        {recipe.skill}
                      </p>
                    </div>
                  </div>

                  {recipe.cookingTime && (
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 shrink-0"
                        style={{ color: "#7A8854" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-muted-foreground">Cooking Time</p>
                        <p className="font-semibold" style={{ color: "#0D5F3A" }}>
                          {recipe.cookingTime} minutes
                        </p>
                      </div>
                    </div>
                  )}

                  {recipe.dietary && recipe.dietary.length > 0 && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 shrink-0 mt-0.5"
                        style={{ color: "#7A8854" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-muted-foreground">Dietary</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {recipe.dietary.map((diet, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs font-medium rounded"
                              style={{ backgroundColor: "#7A8854", color: "white" }}
                            >
                              {diet}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients Card */}
            <Card className="shadow-lg" style={{ backgroundColor: "#E5D1DA" }}>
              <CardHeader>
                <CardTitle style={{ color: "#0D5F3A" }}>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {recipe.ingredients.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-2 flex h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "#7A8854" }}
                      />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Equipment Card */}
            <Card className="shadow-lg" style={{ backgroundColor: "#E5D1DA" }}>
              <CardHeader>
                <CardTitle style={{ color: "#0D5F3A" }}>Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {recipe.equipment.map((tool, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span
                        className="flex h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "#1FA244" }}
                      />
                      <span className="text-sm">{tool}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons (if owner) */}
            {isOwner && (
              <div className="flex gap-3">
                <Button className="flex-1" style={{ backgroundColor: "#7A8854", color: "white" }}>
                  Edit Recipe
                </Button>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Instructions */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg h-full" style={{ backgroundColor: "#E5D1DA" }}>
              <CardHeader className="border-b" style={{ borderColor: "#A28F7A" }}>
                <CardTitle className="text-3xl" style={{ color: "#0D5F3A" }}>
                  {recipe.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: "#0D5F3A" }}>
                  Instructions
                </h2>
                <div className="space-y-5">
                  {recipe.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-4 rounded-lg p-5 transition-all hover:shadow-md"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: "#7A8854" }}
                      >
                        {i + 1}
                      </div>
                      <p className="flex-1 leading-relaxed text-gray-800">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
