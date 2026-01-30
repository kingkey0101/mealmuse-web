"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/recipes");
    }
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && !mounted)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dark Teal Background */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0D5F3A" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 sm:mb-8"
            >
              <img
                src="/favicon.ico"
                alt="MealMuse Logo"
                className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 drop-shadow-2xl"
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium"
              style={{ color: "#E5D1DA" }}
            >
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <span className="hidden xs:inline">Your AI-Powered Recipe Assistant</span>
              <span className="xs:hidden">AI Recipe Assistant</span>
            </motion.div>

            {/* Headline with Serif Font in Beige */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-4 sm:mb-6 max-w-4xl font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
              style={{
                color: "#E5D1DA",
                fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif",
              }}
            >
              Discover Your Next
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Culinary Adventure
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 sm:mb-10 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed px-2 sm:px-0"
              style={{ color: "rgba(229, 209, 218, 0.9)" }}
            >
              Chat with your personal AI chef, explore curated recipes, and master every dish with
              step-by-step guidance. Your intelligent kitchen companion is here to make cooking
              effortless and fun.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col xs:flex-row items-center gap-3 sm:gap-4 md:gap-6 w-full xs:w-auto justify-center max-w-2xl mx-auto"
            >
              <Link href="/auth/register" className="w-full xs:w-72 lg:w-64 flex-shrink-0">
                <Button
                  size="lg"
                  className="w-full h-12 xs:h-12 sm:h-12 lg:h-11 gap-2 px-4 xs:px-6 sm:px-7 lg:px-6 text-sm xs:text-sm sm:text-base lg:text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 whitespace-nowrap"
                  style={{
                    backgroundColor: "#E8A628",
                    color: "#1A1A1A",
                    border: "none",
                  }}
                >
                  Start Cooking Free
                  <svg
                    className="h-4 w-4 xs:h-5 xs:w-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full xs:w-72 lg:w-64 flex-shrink-0">
                <Button
                  size="lg"
                  className="w-full h-12 xs:h-12 sm:h-12 lg:h-11 px-4 xs:px-6 sm:px-7 lg:px-6 text-sm xs:text-sm sm:text-base lg:text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
                  style={{
                    backgroundColor: "#E5D1DA",
                    color: "#1A1A1A",
                    border: "none",
                  }}
                >
                  Log In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-16 sm:h-24"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0,64 C360,120 1080,0 1440,64 L1440,120 L0,120 Z" fill="#FDFDFB" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Cook with Confidence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From beginner-friendly guides to advanced techniques, MealMuse has you covered.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "rgba(122, 136, 84, 0.1)" }}
                  >
                    <svg
                      className="h-7 w-7"
                      style={{ color: "#7A8854" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Curated Recipe Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Access hundreds of recipes from global cuisines, organized by skill level,
                    dietary preferences, and cooking time.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 - AI Chef Chatbot */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full border-2 hover:border-accent/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "rgba(232, 166, 40, 0.1)" }}
                  >
                    <svg
                      className="h-7 w-7"
                      style={{ color: "#E8A628" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Personal AI Chef Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Ask cooking questions, get recipe suggestions, substitute ingredients, and
                    receive instant culinary advice from your AI-powered chef assistant 24/7.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-lg group sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "rgba(31, 162, 68, 0.1)" }}
                  >
                    <svg
                      className="h-7 w-7"
                      style={{ color: "#1FA244" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Step-by-Step Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Follow clear, detailed instructions with ingredient lists, equipment needs,
                    cooking times, and pro tips for perfect results every time.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32" style={{ backgroundColor: "#F5F5F3" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-2xl" style={{ backgroundColor: "#7A8854" }}>
              <CardContent className="p-10 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#FDFDFB" }}>
                  Ready to Transform Your Cooking?
                </h2>
                <p
                  className="text-lg mb-8 max-w-2xl mx-auto"
                  style={{ color: "rgba(253, 253, 251, 0.9)" }}
                >
                  Join thousands of home chefs who have elevated their culinary skills with
                  MealMuse.
                </p>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="h-14 gap-2 px-10 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    style={{
                      backgroundColor: "#E8A628",
                      color: "#1A1A1A",
                      border: "none",
                    }}
                  >
                    Get Started Now
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
