import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CanceledPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-4xl">💭</span>
            </div>
            <CardTitle className="text-3xl" style={{ color: "#0D5F3A" }}>
              Checkout Canceled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
              No worries! Your subscription was not activated.
            </p>

            <p className="text-muted-foreground">
              You can always upgrade later when you&apos;re ready to unlock premium features.
            </p>

            <div className="rounded-lg p-6" style={{ backgroundColor: "rgba(122, 136, 84, 0.1)" }}>
              <h3 className="font-semibold mb-3" style={{ color: "#7A8854" }}>
                Still interested in Premium?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get access to AI-powered recipe tools, unlimited favorites, meal planning, and
                more.
              </p>
              <Link href="/premium">
                <Button
                  className="font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
                    color: "white",
                  }}
                >
                  View Premium Plans
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/recipes" className="flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Continue with Free Plan
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Have questions? Contact us at{" "}
                <a href="mailto:support@mymealmuse.com" className="underline" style={{ color: "#0D5F3A" }}>
                  support@mymealmuse.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
