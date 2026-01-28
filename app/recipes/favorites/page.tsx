import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import FavoritesClient from "./FavoritesClient";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#0D5F3A" }}>
            My Favorites
          </h1>
          <p className="text-lg text-muted-foreground">
            Recipes you&apos;ve saved for quick access
          </p>
        </div>
        <FavoritesClient />
      </div>
    </DashboardLayout>
  );
}
