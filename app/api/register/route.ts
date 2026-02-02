import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection("users");

    const existing = await users.findOne({ email });

    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Generate unique userId using MongoDB ObjectId
    const userId = new ObjectId();

    const result = await users.insertOne({
      _id: userId,
      email,
      password: hashed,
      createdAt: new Date(),
      subscription: {
        tier: "free",
        status: "active",
      },
      favorites: [],
    });

    console.log("✅ User registered:", email, "userId:", userId.toString());
    return NextResponse.json({ ok: true, userId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
