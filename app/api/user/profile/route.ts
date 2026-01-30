import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phoneNumber } = await req.json();

    // Validate input
    if (name && name.length > 100) {
      return Response.json({ error: "Name too long" }, { status: 400 });
    }

    if (phoneNumber && phoneNumber.length > 20) {
      return Response.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          name: name || null,
          phoneNumber: phoneNumber || null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: "Profile updated successfully",
      name,
      phoneNumber,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
