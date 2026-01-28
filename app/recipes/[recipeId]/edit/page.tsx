import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import EditRecipeForm from "./EditRecipeForm";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export default async function EditRecipePage(props: { params: Promise<{ recipeId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const params = await props.params;
  const { recipeId } = params;

  // Fetch the recipe
  const client = await clientPromise;
  const db = client.db();
  const recipe = await db.collection("recipes").findOne({
    _id: new ObjectId(recipeId),
  });

  if (!recipe) {
    redirect("/recipes/my-recipes");
  }

  // Verify ownership
  if (recipe.userId !== session.user.id) {
    redirect("/recipes/my-recipes");
  }

  // Convert recipe to plain object
  const recipeData = {
    _id: recipe._id.toString(),
    title: recipe.title,
    cuisine: recipe.cuisine,
    skill: recipe.skill,
    dietary: recipe.dietary || [],
    cookingTime: recipe.cookingTime || "",
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    equipment: recipe.equipment || [],
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <EditRecipeForm recipe={recipeData} />
      </div>
    </DashboardLayout>
  );
}
