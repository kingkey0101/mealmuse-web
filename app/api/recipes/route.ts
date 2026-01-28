import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, cuisine, skill, dietary, cookingTime, ingredients, steps, equipment } = body;

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("recipes").insertOne(recipe);

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
