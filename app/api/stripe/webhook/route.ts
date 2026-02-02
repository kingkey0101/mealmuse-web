import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDatabase } from "@/lib/db";
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

  const db = await getDatabase();

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
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) {
    console.error("Missing customerId or subscriptionId in checkout session");
    return;
  }

  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get customer email to find user by email
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as any).email;

  if (!email) {
    console.error("Missing customer email");
    return;
  }

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        "subscription.tier": "premium",
        "subscription.status": subscription.status,
        "subscription.stripeCustomerId": customerId,
        "subscription.stripeSubscriptionId": subscriptionId,
        "subscription.currentPeriodEnd": new Date(
          (subscription as any)["current_period_end"] * 1000
        ),
        "subscription.cancelAtPeriodEnd": (subscription as any)["cancel_at_period_end"],
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Subscription activated for customer ${email}`);
}

/**
 * Handle subscription updates (plan changes, renewals, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  const customerId = subscription.customer as string;

  if (!customerId) {
    console.error("Missing customerId in subscription");
    return;
  }

  // Get customer email to find user by email
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as any).email;

  if (!email) {
    console.error("Missing customer email");
    return;
  }

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        "subscription.status": subscription.status,
        "subscription.currentPeriodEnd": new Date(
          (subscription as any)["current_period_end"] * 1000
        ),
        "subscription.cancelAtPeriodEnd": (subscription as any)["cancel_at_period_end"],
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Subscription updated for ${email}: ${subscription.status}`);
}

/**
 * Handle subscription cancellation/deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  const customerId = subscription.customer as string;

  if (!customerId) {
    console.error("Missing customerId in subscription");
    return;
  }

  // Get customer email to find user by email
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as any).email;

  if (!email) {
    console.error("Missing customer email");
    return;
  }

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        "subscription.tier": "free",
        "subscription.status": "canceled",
        "subscription.cancelAtPeriodEnd": false,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Subscription deleted for ${email}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  const customerId = invoice.customer as string;

  if (!customerId) return;

  // Get customer email to find user by email
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as any).email;

  if (!email) return;

  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update payment status and period
  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        "subscription.status": "active",
        "subscription.currentPeriodEnd": new Date(
          (subscription as any)["current_period_end"] * 1000
        ),
        updatedAt: new Date(),
      },
    }
  );

  console.log(`✅ Payment succeeded for ${email}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, db: any) {
  const customerId = invoice.customer as string;

  if (!customerId) return;

  // Get customer email to find user by email
  const customer = await stripe.customers.retrieve(customerId);
  const email = (customer as any).email;

  if (!email) return;

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        "subscription.status": "past_due",
        updatedAt: new Date(),
      },
    }
  );

  console.log(`⚠️ Payment failed for ${email}`);
}
