import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { aiChefChat } from "@/lib/huggingface";

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

    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const response = await aiChefChat(message, context);

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
