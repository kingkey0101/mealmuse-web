import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Get recipes - show:
    // 1. All approved recipes (including seeded recipes)
    // 2. All recipes without userId (seeded from DB)
    // 3. User's own recipes (regardless of status)
    const recipes = await db
      .collection("recipes")
      .find({
        $or: [
          { status: "approved" }, // Approved recipes visible to all
          { userId: { $exists: false } }, // Seeded recipes (no userId)
          { userId: session.user.id }, // Own recipes visible regardless of status
        ],
      })
      .toArray();

    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      cuisine,
      skill,
      dietary,
      cookingTime,
      ingredients,
      steps,
      equipment,
      source,
      generatedByAI,
      aiInteractionId,
      searchIntent,
    } = body;

    // Validate required fields
    if (!title || !cuisine || !skill || !ingredients || !steps || !equipment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!Array.isArray(ingredients) || !Array.isArray(steps) || !Array.isArray(equipment)) {
      return NextResponse.json(
        { error: "Ingredients, steps, and equipment must be arrays" },
        { status: 400 }
      );
    }

    // Validate dietary is an array if provided
    if (dietary && !Array.isArray(dietary)) {
      return NextResponse.json({ error: "Dietary must be an array" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const recipe = {
      title,
      cuisine,
      skill,
      dietary: dietary || [],
      cookingTime: cookingTime || null,
      ingredients,
      steps,
      equipment,
      userId: session.user.id,
      source: source || "user_generated",
      generatedByAI: generatedByAI || null,
      searchIntent: searchIntent || null,
      status: "pending", // New recipes start as pending for approval
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("recipes").insertOne(recipe);

    if (aiInteractionId) {
      try {
        const { ObjectId } = await import("mongodb");
        await db.collection("ai_interactions").updateOne(
          { _id: new ObjectId(aiInteractionId), userId: session.user.id },
          {
            $set: {
              recipeId: result.insertedId.toString(),
              userSavedRecipe: true,
            },
          }
        );
      } catch (err) {
        console.error("Failed to link ai_interactions to recipe:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        recipeId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recipeId, title, cuisine, skill, dietary, cookingTime, ingredients, steps, equipment } =
      body;

    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    // Validate required fields
    if (!title || !cuisine || !skill || !ingredients || !steps || !equipment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!Array.isArray(ingredients) || !Array.isArray(steps) || !Array.isArray(equipment)) {
      return NextResponse.json(
        { error: "Ingredients, steps, and equipment must be arrays" },
        { status: 400 }
      );
    }

    if (dietary && !Array.isArray(dietary)) {
      return NextResponse.json({ error: "Dietary must be an array" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import("mongodb");

    // Verify ownership
    const existingRecipe = await db.collection("recipes").findOne({
      _id: new ObjectId(recipeId),
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own recipes" }, { status: 403 });
    }

    // Update the recipe
    await db.collection("recipes").updateOne(
      { _id: new ObjectId(recipeId) },
      {
        $set: {
          title,
          cuisine,
          skill,
          dietary: dietary || [],
          cookingTime: cookingTime || null,
          ingredients,
          steps,
          equipment,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import("mongodb");

    // Verify ownership
    const recipe = await db.collection("recipes").findOne({
      _id: new ObjectId(recipeId),
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own recipes" }, { status: 403 });
    }

    // Delete the recipe
    await db.collection("recipes").deleteOne({ _id: new ObjectId(recipeId) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
