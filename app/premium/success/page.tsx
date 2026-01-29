import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SuccessPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-2 shadow-xl" style={{ borderColor: "#1FA244" }}>
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(31, 162, 68, 0.1)" }}>
              <span className="text-4xl">🎉</span>
            </div>
            <CardTitle className="text-3xl" style={{ color: "#0D5F3A" }}>
              Welcome to Premium!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
              Thank you for subscribing! Your premium features are now active.
            </p>

            <div className="rounded-lg p-6" style={{ backgroundColor: "rgba(232, 166, 40, 0.1)" }}>
              <h3 className="font-semibold mb-4" style={{ color: "#E8A628" }}>
                You now have access to:
              </h3>
              <ul className="space-y-3 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-xl">🤖</span>
                  <span>AI Chef Chatbot for personalized cooking advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✨</span>
                  <span>AI Recipe Generator from your ingredients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">📅</span>
                  <span>Meal Planning Calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">🛒</span>
                  <span>Smart Shopping List Assistant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">❤️</span>
                  <span>Unlimited Favorite Recipes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">📚</span>
                  <span>Ingredient Encyclopedia</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/chat" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
                    color: "white",
                  }}
                >
                  Try AI Chef Chat
                </Button>
              </Link>
              <Link href="/recipes" className="flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Recipes
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Visit our{" "}
                <Link href="/account/subscription" className="underline" style={{ color: "#0D5F3A" }}>
                  subscription settings
                </Link>{" "}
                to manage your plan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
