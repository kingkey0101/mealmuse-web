"use client";

import { motion } from "framer-motion";

interface FeatureLimitBadgeProps {
  used: number;
  limit: number;
  label?: string;
  showWarning?: boolean;
}

export function FeatureLimitBadge({
  used,
  limit,
  label = "favorites",
  showWarning = true,
}: FeatureLimitBadgeProps) {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  const getColor = () => {
    if (isAtLimit) return "#EF4444"; // red
    if (isNearLimit && showWarning) return "#F59E0B"; // amber
    return "#7A8854"; // olive green
  };

  const color = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2"
    >
      <div className="flex items-center gap-1.5">
        <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color }}>
          {used}/{limit === Infinity ? "∞" : limit}
        </span>
      </div>

      {isAtLimit && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-medium text-red-600"
        >
          Limit reached
        </motion.span>
      )}

      {isNearLimit && !isAtLimit && showWarning && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-medium text-amber-600"
        >
          Almost full
        </motion.span>
      )}
    </motion.div>
  );
}
