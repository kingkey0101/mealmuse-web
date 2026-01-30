import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

/**
 * Get all pending recipes for admin review
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin (you can customize this check)
    if (!session?.user?.email || !process.env.ADMIN_EMAILS?.includes(session.user.email)) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const recipesCollection = db.collection("recipes");

    const recipes = await recipesCollection
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      recipes: recipes.map((r) => ({
        ...r,
        _id: r._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching pending recipes:", error);
    return Response.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
