import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecipesClient from "./RecipesClient";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const initialPage = params.page ? parseInt(params.page, 10) : 1;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: "#0D5F3A" }}>
                Your Recipe Collection
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore curated recipes and save your favorites
              </p>
            </div>
          </div>
        </div>
        <RecipesClient initialPage={initialPage} />
      </div>
    </DashboardLayout>
  );
}
