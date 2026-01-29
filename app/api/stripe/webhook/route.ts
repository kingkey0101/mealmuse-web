import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import clientPromise from "@/lib/db";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe Webhook Handler
 * Processes Stripe events and syncs subscription status to database
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, db);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, db);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, db);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, db);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, db);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, db: any) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.error("Missing userId or subscriptionId in checkout session");
    return;
  }

  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.tier": "premium",
        "subscription.status": subscription.status,
        "subscription.stripeCustomerId": session.customer as string,
        "subscription.stripeSubscriptionId": subscriptionId,
        "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
        "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Subscription activated for user ${userId}`);
}

/**
 * Handle subscription updates (plan changes, renewals, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.status": subscription.status,
        "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
        "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Subscription updated for user ${userId}: ${subscription.status}`);
}

/**
 * Handle subscription cancellation/deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.tier": "free",
        "subscription.status": "canceled",
        "subscription.cancelAtPeriodEnd": false,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Subscription deleted for user ${userId}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) return;

  // Update payment status and period
  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.status": "active",
        "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Payment succeeded for user ${userId}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, db: any) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) return;

  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.status": "past_due",
        updatedAt: new Date(),
      },
    }
  );

  console.log(`⚠️ Payment failed for user ${userId}`);
}
