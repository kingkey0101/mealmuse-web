import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { generateRecipe } from "@/lib/huggingface";

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

    const { ingredients, cuisine, dietary } = await request.json();

    if (!ingredients || typeof ingredients !== "string") {
      return Response.json({ error: "Ingredients are required" }, { status: 400 });
    }

    const recipe = await generateRecipe(ingredients, cuisine, dietary);

    return Response.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("Recipe generation error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
