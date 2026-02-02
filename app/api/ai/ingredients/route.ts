import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { explainIngredient, suggestSubstitutes } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is premium
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user || user.subscription?.tier !== "premium") {
      return Response.json({ error: "Premium feature" }, { status: 403 });
    }

    const { ingredient, type } = await request.json();

    if (!ingredient || typeof ingredient !== "string") {
      return Response.json({ error: "Ingredient is required" }, { status: 400 });
    }

    let result: string;

    if (type === "substitutes") {
      const { reason } = await request.json();
      result = await suggestSubstitutes(ingredient, reason);
    } else {
      result = await explainIngredient(ingredient);
    }

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Ingredient analysis error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to analyze ingredient" },
      { status: 500 }
    );
  }
}
