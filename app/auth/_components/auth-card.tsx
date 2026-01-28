"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">{title}</CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
