"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset link");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-3 sm:px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-10 text-center"
        >
          <img
            src="/favicon.ico"
            alt="MealMuse Logo"
            className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3 drop-shadow-lg"
          />
          <h1
            className="font-serif text-3xl sm:text-4xl font-bold mb-2 sm:mb-3"
            style={{ color: "#7A8854" }}
          >
            MealMuse
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Reset your password</p>
        </motion.div>

        <Card className="shadow-2xl border-border/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 sm:space-y-3 text-center pb-6 sm:pb-8 pt-6 sm:pt-8">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Forgot Password</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {success
                ? "Password reset link sent!"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
            {success ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-green-500/10 border border-green-500/50 p-4"
                >
                  <div className="text-center space-y-3">
                    <div className="text-5xl">📧</div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Check your email!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The link will expire in 1 hour for security reasons.
                    </p>
                  </div>
                </motion.div>

                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder.
                  </p>
                  <Link
                    href="/auth/login"
                    className="text-sm font-semibold transition-colors hover:underline block"
                    style={{ color: "#7A8854" }}
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg bg-destructive/10 border border-destructive/50 p-3 sm:p-4"
                  >
                    <p className="text-xs sm:text-sm font-medium text-destructive text-center">
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 font-semibold text-sm sm:text-base transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: "#7A8854" }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </motion.div>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm font-semibold transition-colors hover:underline"
                    style={{ color: "#7A8854" }}
                  >
                    ← Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
