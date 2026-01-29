import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { rewriteRecipe } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is premium
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user || user.subscription?.tier !== "premium") {
      return Response.json({ error: "Premium feature" }, { status: 403 });
    }

    const { recipe, style, skillLevel } = await request.json();

    if (!recipe || typeof recipe !== "string") {
      return Response.json({ error: "Recipe content is required" }, { status: 400 });
    }

    if (!style || !skillLevel) {
      return Response.json({ error: "Style and skill level are required" }, { status: 400 });
    }

    const rewritten = await rewriteRecipe(recipe, style, skillLevel);

    return Response.json({
      success: true,
      recipe: rewritten,
    });
  } catch (error) {
    console.error("Recipe rewrite error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to rewrite recipe" },
      { status: 500 }
    );
  }
}
