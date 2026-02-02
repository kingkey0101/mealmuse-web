import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { AIChefChatClient } from "@/components/ai/AIChefChat";
import { getDatabase } from "@/lib/db";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const db = await getDatabase();
  const user = await db.collection("users").findOne({ email: session.user.email });
  const isPremium = user?.subscription?.tier === "premium";

  if (!isPremium) {
    redirect("/premium");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#0D5F3A" }}>
              AI Chef Chat
            </h1>
            <span
              className="px-3 py-1 text-sm font-semibold rounded-full"
              style={{ backgroundColor: "#E8A628", color: "#1A1A1A" }}
            >
              Premium
            </span>
          </div>
          <p className="text-lg text-muted-foreground">
            Ask your personal AI chef for cooking advice, recipe suggestions, and culinary tips
          </p>
        </div>

        {/* AI Chat Interface */}
        <AIChefChatClient />
      </div>
    </DashboardLayout>
  );
}
