import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Approve or reject a recipe
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email || !process.env.ADMIN_EMAILS?.includes(session.user.email)) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { recipeId, status, feedback } = await req.json();

    if (!recipeId || !["approved", "rejected"].includes(status)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const recipesCollection = db.collection("recipes");
    const usersCollection = db.collection("users");

    // Get recipe details
    const recipe = await recipesCollection.findOne({
      _id: new ObjectId(recipeId),
    });

    if (!recipe) {
      return Response.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Update recipe status
    await recipesCollection.updateOne(
      { _id: new ObjectId(recipeId) },
      {
        $set: {
          status,
          feedback: feedback || "",
          reviewedAt: new Date(),
          reviewedBy: session.user.email,
        },
      }
    );

    // Get user email for approval notification
    await usersCollection.findOne({ _id: new ObjectId(recipe.userId) });

    // TODO: Send email notification to user with feedback

    return Response.json({
      message: `Recipe ${status} successfully`,
      recipeId,
      status,
    });
  } catch (error) {
    console.error("Error updating recipe status:", error);
    return Response.json({ error: "Failed to update recipe status" }, { status: 500 });
  }
}
