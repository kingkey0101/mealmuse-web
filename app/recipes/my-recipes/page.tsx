import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import MyRecipesClient from "./MyRecipesClient";

export default async function MyRecipesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <h1 
            className="text-4xl font-bold tracking-tight"
            style={{ color: "#0D5F3A" }}
          >
            My Recipes
          </h1>
          <p className="text-lg text-muted-foreground">
            Recipes you've created and shared with the community
          </p>
        </div>
        <MyRecipesClient />
      </div>
    </DashboardLayout>
  );
}
