import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      token: string;
      tier?: "free" | "premium";
      subscription?: {
        status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
        stripeCustomerId?: string;
        stripeSubscriptionId?: string;
        currentPeriodEnd?: Date;
        cancelAtPeriodEnd?: boolean;
      };
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // encryption: false,
  }
}
