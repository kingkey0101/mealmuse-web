import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, don't reveal if the email exists or not
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent",
        resetLink: "", // Don't send link if user doesn't exist
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // In production, you would send an email here
    // For now, we'll return the reset link for testing
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // await sendResetEmail(email, resetLink);

    return NextResponse.json({
      message: "Password reset link sent",
      resetLink, // Remove this in production
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
