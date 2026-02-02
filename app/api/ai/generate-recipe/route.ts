import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { generateRecipe, generateText } from "@/lib/huggingface";

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

    const { ingredients, cuisine, dietary, prompt, tags, cookingTimePreference, dietaryTags } =
      await request.json();

    if (!prompt && (!ingredients || typeof ingredients !== "string")) {
      return Response.json({ error: "Ingredients or prompt are required" }, { status: 400 });
    }

    const resolvedPrompt =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim()
        : `Generate a recipe using these ingredients: ${ingredients}`;

    const promptWithFormat = `${resolvedPrompt}

Format the recipe with:
1. Recipe Title
2. Cooking Time
3. Servings
4. Ingredients list
5. Step-by-step instructions
6. Tips

Recipe:`;

    const recipe = prompt
      ? await generateText("llama-3.1-8b-instant", promptWithFormat, {
          maxNewTokens: 800,
          temperature: 0.7,
        })
      : await generateRecipe(ingredients, cuisine, dietary);

    const extractedTags = Array.isArray(tags)
      ? tags.map((tag) => String(tag).toLowerCase())
      : [cuisine, ...(dietary || [])].filter(Boolean).map((tag) => String(tag).toLowerCase());

    const searchIntent = {
      cuisine: cuisine || undefined,
      diet:
        Array.isArray(dietaryTags) && dietaryTags.length > 0 ? dietaryTags.join(", ") : undefined,
      skill: "beginner",
      cookingTime: typeof cookingTimePreference === "number" ? cookingTimePreference : undefined,
    };

    const conversationId = crypto.randomUUID();

    const interactionResult = await db.collection("ai_interactions").insertOne({
      userId: session.user.id,
      type: "recipe_generation",
      userQuery: resolvedPrompt,
      aiResponse: recipe,
      extractedKeywords: extractedTags,
      extractedTags,
      model: "llama-3.1-8b-instant",
      created_at: new Date(),
      recipeId: null,
      searchIntent,
      conversationId,
      feedbackScore: null,
      userSavedRecipe: false,
      userRatedHelpful: null,
    });

    return Response.json({
      success: true,
      recipe,
      interactionId: interactionResult.insertedId.toString(),
      conversationId,
      extractedTags,
      model: "llama-3.1-8b-instant",
      prompt: resolvedPrompt,
      searchIntent,
    });
  } catch (error) {
    console.error("Recipe generation error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
