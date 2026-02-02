import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { aiChefChat } from "@/lib/huggingface";

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

    const { message, context, conversationHistory, topic, extractedKeywords } =
      await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const response = await aiChefChat(message, context);

    const fallbackKeywords = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word: string) => word.length > 2)
        .slice(0, 8);

    await db.collection("ai_interactions").insertOne({
      userId: session.user.id,
      type: "chef_chat",
      userQuery: message,
      aiResponse: response,
      extractedKeywords: Array.isArray(extractedKeywords)
        ? extractedKeywords
        : fallbackKeywords(message),
      extractedTags: [],
      model: "llama-3.1-8b-instant",
      created_at: new Date(),
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      topic: typeof topic === "string" ? topic : "general_cooking",
      feedbackScore: null,
      userSavedRecipe: false,
      userRatedHelpful: null,
    });

    return Response.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("AI Chef chat error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate response" },
      { status: 500 }
    );
  }
}
