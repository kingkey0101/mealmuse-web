import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const shoppingList = await db
      .collection("shoppingLists")
      .findOne({ userId: session.user.id });

    return NextResponse.json(
      {
        items: shoppingList?.items || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    return NextResponse.json({ error: "Failed to fetch shopping list" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { item } = body;

    if (!item || !item.name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newItem = {
      id: Date.now().toString(),
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || "",
      checked: false,
      addedAt: new Date(),
    };

    await db.collection("shoppingLists").updateOne(
      { userId: session.user.id },
      {
        $push: { items: newItem } as any,
        $setOnInsert: {
          userId: session.user.id,
          createdAt: new Date(),
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { itemId, checked } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("shoppingLists").updateOne(
      { userId: session.user.id, "items.id": itemId },
      {
        $set: {
          "items.$.checked": checked,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const clearChecked = searchParams.get("clearChecked") === "true";

    const client = await clientPromise;
    const db = client.db();

    if (clearChecked) {
      // Remove all checked items
      await db.collection("shoppingLists").updateOne(
        { userId: session.user.id },
        {
          $pull: { items: { checked: true } },
          $set: { updatedAt: new Date() },
        }
      );
    } else if (itemId) {
      // Remove specific item
      await db.collection("shoppingLists").updateOne(
        { userId: session.user.id },
        {
          $pull: { items: { id: itemId } },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      return NextResponse.json({ error: "Item ID or clearChecked required" }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
