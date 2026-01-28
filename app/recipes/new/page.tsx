import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import RecipeForm from "./RecipeForm";

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <RecipeForm />
      </div>
    </DashboardLayout>
  );
}
