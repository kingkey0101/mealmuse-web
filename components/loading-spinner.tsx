"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <div className="flex flex-col items-center gap-6">
        {/* MealMuse Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/favicon.ico"
            alt="MealMuse"
            width={96}
            height={96}
            priority
            className="h-24 w-24"
          />
        </div>

        {/* Loading Dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "#7A8854" }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <p className="text-center text-sm font-medium" style={{ color: "#0D5F3A" }}>
          Preparing your recipes...
        </p>
      </div>
    </div>
  );
}
