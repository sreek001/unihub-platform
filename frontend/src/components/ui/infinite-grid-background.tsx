"use client";

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionTemplate, useAnimationFrame } from "framer-motion";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <motion.pattern
          id="grid-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-300/80"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};

export const InfiniteGridBackground = ({ children }: { children: React.ReactNode }) => {
  const [gridSize] = useState(40);

  // NATIVE POINTER TRACKING: Bypasses React synthetic events for zero lag
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const updateMouse = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("pointermove", updateMouse, { passive: true });
    return () => window.removeEventListener("pointermove", updateMouse);
  }, [mouseX, mouseY]);

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);
  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % gridSize);
    gridOffsetY.set((gridOffsetY.get() + speedY) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div className="relative w-full min-h-screen bg-slate-50 overflow-x-hidden flex flex-col">
      {/* Static Base Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>

      {/* Dynamic Flashlight Grid */}
      <motion.div
        className="absolute inset-0 z-0 opacity-100 pointer-events-none"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>

      {/* Subtle Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Dashboard Content */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
