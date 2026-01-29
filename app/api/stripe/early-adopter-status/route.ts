import { NextResponse } from "next/server";
import { getEarlyAdopterStatus } from "@/lib/early-adopter";

/**
 * Get early adopter status
 * Returns slot availability and eligibility
 */
export async function GET() {
  try {
    const status = await getEarlyAdopterStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching early adopter status:", error);
    return NextResponse.json({ error: "Failed to fetch early adopter status" }, { status: 500 });
  }
}
