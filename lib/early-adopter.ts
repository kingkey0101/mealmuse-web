/**
 * Early Adopter Discount Tracking
 * Manages limited-time discount for first 50 users
 * ⚠️ SERVER-ONLY: This module uses MongoDB and must only run on the server
 */

import "server-only";

import clientPromise from "@/lib/db";
import { PLANS } from "@/lib/stripe";

export interface EarlyAdopterStatus {
  isEligible: boolean;
  slotsRemaining: number;
  usedSlots: number;
  maxSlots: number;
}

/**
 * Get current early adopter status
 */
export async function getEarlyAdopterStatus(): Promise<EarlyAdopterStatus> {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Count early adopter subscriptions
    const earlyAdopters = await db.collection("earlyAdopters").countDocuments({ status: "active" });

    const maxSlots = PLANS.earlyAdopter.slots;
    const slotsRemaining = Math.max(0, maxSlots - earlyAdopters);

    return {
      isEligible: slotsRemaining > 0,
      slotsRemaining,
      usedSlots: earlyAdopters,
      maxSlots,
    };
  } catch (error) {
    console.error("Error getting early adopter status:", error);
    return {
      isEligible: false,
      slotsRemaining: 0,
      usedSlots: PLANS.earlyAdopter.slots,
      maxSlots: PLANS.earlyAdopter.slots,
    };
  }
}

/**
 * Check if a user has already claimed early adopter pricing
 */
export async function hasUserClaimedEarlyAdopter(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const record = await db.collection("earlyAdopters").findOne({ userId });
    return !!record;
  } catch (error) {
    console.error("Error checking early adopter claim:", error);
    return false;
  }
}

/**
 * Claim early adopter pricing for a user
 */
export async function claimEarlyAdopterDiscount(
  userId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Check if user already claimed
    const existing = await db.collection("earlyAdopters").findOne({ userId });
    if (existing) {
      return { success: false, message: "You have already claimed the early adopter discount" };
    }

    // Check if slots remain
    const status = await getEarlyAdopterStatus();
    if (!status.isEligible) {
      return { success: false, message: "Early adopter slots are sold out" };
    }

    // Record the claim
    await db.collection("earlyAdopters").insertOne({
      userId,
      email,
      claimedAt: new Date(),
      status: "active",
    });

    return { success: true, message: "Early adopter discount claimed!" };
  } catch (error) {
    console.error("Error claiming early adopter discount:", error);
    return { success: false, message: "Failed to claim discount" };
  }
}

/**
 * Cancel early adopter discount (if user downgrades or cancels)
 */
export async function cancelEarlyAdopterDiscount(userId: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db();

    await db
      .collection("earlyAdopters")
      .updateOne({ userId }, { $set: { status: "canceled", canceledAt: new Date() } });
  } catch (error) {
    console.error("Error canceling early adopter discount:", error);
  }
}
