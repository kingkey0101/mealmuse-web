import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import RecipeForm from "./RecipeForm";
import { RecipeGenerator } from "@/components/ai/RecipeGenerator";
import { getDatabase } from "@/lib/db";

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user is premium
  const db = await getDatabase();
  const user = await db.collection("users").findOne({ email: session.user.email });
  const isPremium = user?.subscription?.tier === "premium";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {isPremium && (
          <div className="mb-8">
            <RecipeGenerator />
          </div>
        )}
        <RecipeForm />
      </div>
    </DashboardLayout>
  );
}
