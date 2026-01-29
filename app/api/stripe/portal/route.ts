import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import clientPromise from "@/lib/db";

/**
 * Create Stripe Billing Portal Session
 * Allows users to manage their subscription, payment methods, and billing history
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's Stripe customer ID
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    const customerId = user?.subscription?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    // Determine base URL - use localhost in development, production URL otherwise
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXTAUTH_URL || 'http://mymealmuse.com';

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/account/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
