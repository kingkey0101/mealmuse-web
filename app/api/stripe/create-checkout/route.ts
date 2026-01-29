import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, getPlan, PlanInterval } from "@/lib/stripe";
import {
  getEarlyAdopterStatus,
  hasUserClaimedEarlyAdopter,
  claimEarlyAdopterDiscount,
} from "@/lib/early-adopter";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { interval, useEarlyAdopter } = await req.json();

    // Validate interval
    if (interval !== "monthly" && interval !== "annual") {
      return NextResponse.json({ error: "Invalid plan interval" }, { status: 400 });
    }

    let priceId: string;
    let planType: string = interval;

    // Handle early adopter pricing
    if (useEarlyAdopter && interval === "monthly") {
      const hasAlreadyClaimed = await hasUserClaimedEarlyAdopter(session.user.id);

      if (hasAlreadyClaimed) {
        return NextResponse.json(
          { error: "You have already claimed the early adopter discount" },
          { status: 400 }
        );
      }

      const status = await getEarlyAdopterStatus();
      if (!status.isEligible) {
        return NextResponse.json(
          { error: "Early adopter slots are sold out. Regular pricing available." },
          { status: 400 }
        );
      }

      // Claim the discount
      const result = await claimEarlyAdopterDiscount(session.user.id, session.user.email!);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      planType = "earlyAdopter";
      // Use monthly price ID with special metadata
      priceId = process.env.STRIPE_PRICE_ID_MONTHLY || "";
    } else {
      const plan = getPlan(interval as PlanInterval);
      priceId = plan.priceId;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Get user from database to check for existing customer ID
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    let customerId = user?.subscription?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await db.collection("users").updateOne(
        { email: session.user.email },
        {
          $set: {
            "subscription.stripeCustomerId": customerId,
          },
        }
      );
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/premium/canceled`,
      metadata: {
        userId: session.user.id,
        planInterval: interval,
        planType: planType,
        isEarlyAdopter: useEarlyAdopter ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planType: planType,
          isEarlyAdopter: useEarlyAdopter ? "true" : "false",
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
