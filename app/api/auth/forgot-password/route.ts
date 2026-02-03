import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

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
        message: "If an account exists, a reset link has been sent to your email",
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

    // Send email with reset link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send the email
    const emailSent = await sendPasswordResetEmail(email, resetLink);

    if (!emailSent) {
      console.error("Failed to send password reset email to:", email);
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
