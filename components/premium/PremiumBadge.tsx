"use client";

import { motion } from "framer-motion";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PremiumBadge({ size = "md", className = "" }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        background: "linear-gradient(135deg, #E8A628 0%, #D4941F 100%)",
        color: "white",
        boxShadow: "0 2px 8px rgba(232, 166, 40, 0.3)",
      }}
    >
      <span className="text-lg leading-none">✨</span>
      <span>Premium</span>
    </motion.span>
  );
}

export function PremiumFeatureBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${className}`}
      style={{
        backgroundColor: "rgba(232, 166, 40, 0.1)",
        color: "#E8A628",
        border: "1px solid rgba(232, 166, 40, 0.3)",
      }}
    >
      <span className="text-sm leading-none">⭐</span>
      <span>Premium</span>
    </span>
  );
}
