import clientPromise from "@/lib/db";

/**
 * This endpoint migrates existing recipes to add the approval status field.
 * Run this once to update all existing recipes.
 */
export async function POST(req: Request) {
  try {
    // Check for admin API key
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const recipesCollection = db.collection("recipes");

    // Add status field to all recipes that don't have it
    const result = await recipesCollection.updateMany(
      { status: { $exists: false } },
      { $set: { status: "approved", createdAt: new Date() } }
    );

    return Response.json({
      message: "Migration complete",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json({ error: "Migration failed" }, { status: 500 });
  }
}
