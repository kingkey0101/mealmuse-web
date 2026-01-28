import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <h1 
              className="text-4xl font-bold tracking-tight"
              style={{ color: "#0D5F3A" }}
            >
              AI Chef Chat
            </h1>
            <span 
              className="px-3 py-1 text-sm font-semibold rounded-full"
              style={{ backgroundColor: "#E8A628", color: "#1A1A1A" }}
            >
              New
            </span>
          </div>
          <p className="text-lg text-muted-foreground">
            Ask your personal AI chef for cooking advice, recipe suggestions, and culinary tips
          </p>
        </div>

        {/* Coming soon placeholder */}
        <Card className="p-12 text-center border-2" style={{ borderColor: "#E8A628", backgroundColor: "rgba(232, 166, 40, 0.05)" }}>
          <div className="mx-auto max-w-2xl space-y-6">
            <div 
              className="mx-auto h-24 w-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8A628" }}
            >
              <svg
                className="h-12 w-12"
                style={{ color: "#FFFFFF" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold" style={{ color: "#0D5F3A" }}>
                AI Chef Coming Soon!
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're cooking up something special! Our AI chef will soon be able to answer your cooking questions, 
                suggest recipe modifications, help with ingredient substitutions, and provide personalized culinary guidance.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "#7A8854" }}>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                In Development
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Preview */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Recipe Suggestions",
              description: "Get personalized recipe recommendations based on your preferences and dietary needs",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
            {
              title: "Ingredient Help",
              description: "Ask about substitutions, measurements, and how to work with different ingredients",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              ),
            },
            {
              title: "Shopping Lists",
              description: "Automatically generate organized shopping lists from your selected recipes and ingredients",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              ),
            },
            {
              title: "Cooking Techniques",
              description: "Learn proper cooking methods, timing, and techniques to improve your skills",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
            },
          ].map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(122, 136, 84, 0.1)", color: "#7A8854" }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
