import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#0D5F3A" }}>
            Account Settings
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your account details and subscription preferences
          </p>
        </div>

        <SettingsClient userEmail={session.user?.email || ""} />
      </div>
    </DashboardLayout>
  );
}
