"use client";

import React from 'react';
import { motion } from "framer-motion";

interface FloatingPathsProps {
    position: number;
}

function FloatingPaths({ position }: FloatingPathsProps) {
    const paths = Array.from({ length: 36 }, (_, i) => {
        const scale = 200 + i * 10;
        const offsetX = 348;
        const offsetY = 158;
        
        const d = `
            M ${offsetX - scale} ${offsetY}
            C ${offsetX - scale} ${offsetY - scale * 0.5}, 
              ${offsetX - scale * 0.5} ${offsetY - scale * 0.5}, 
              ${offsetX} ${offsetY}
            C ${offsetX + scale * 0.5} ${offsetY + scale * 0.5}, 
              ${offsetX + scale} ${offsetY + scale * 0.5}, 
              ${offsetX + scale} ${offsetY}
            C ${offsetX + scale} ${offsetY - scale * 0.5}, 
              ${offsetX + scale * 0.5} ${offsetY - scale * 0.5}, 
              ${offsetX} ${offsetY}
            C ${offsetX - scale * 0.5} ${offsetY + scale * 0.5}, 
              ${offsetX - scale} ${offsetY + scale * 0.5}, 
              ${offsetX - scale} ${offsetY}
        `.replace(/\s+/g, ' ').trim();
        
        return {
            id: i,
            d,
            color: `rgba(15,23,42,${0.1 + i * 0.03})`,
            width: 0.5 + i * 0.03,
        };
    });

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path, index) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1, 1, 0],
                            opacity: [0, 0.6, 0.6, 0],
                        }}
                        transition={{
                            duration: 15 + index * 0.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: index * 0.2,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

interface BackgroundPathsProps {
    title?: string;
    titleBackground?: boolean;
    backgroundStyle?: "glass" | "gradient" | "solid" | "glow";
    subtitle?: string;
    showGradientOrb?: boolean;
    children?: React.ReactNode;
}

export function BackgroundPaths({
    title = "Infinity Background",
    titleBackground = false,
    backgroundStyle = "glass",
    subtitle = "",
    showGradientOrb = true,
    children,
}: BackgroundPathsProps) {
    const words = title.split(" ");

    const getBackgroundClasses = () => {
        switch (backgroundStyle) {
            case "glass":
                return "bg-white/10 border border-white/20 shadow-2xl";
            case "gradient":
                return "bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-md border border-white/30 shadow-2xl";
            case "solid":
                return "bg-white/90 backdrop-blur-sm shadow-2xl";
            case "glow":
                return "bg-white/5 backdrop-blur-2xl border border-white/30 shadow-2xl shadow-white/20";
            default:
                return "";
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white">
            {showGradientOrb && (
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                </motion.div>
            )}

            <div className="absolute inset-0">
                <FloatingPaths position={1}/>
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="max-w-5xl mx-auto"
                >
                    <motion.div
                        className={`
                            inline-block 
                            ${titleBackground ? `p-8 sm:p-12 md:p-16 rounded-3xl ${getBackgroundClasses()}` : ''}
                            relative
                        `}
                        whileHover={titleBackground ? { scale: 1.02 } : {}}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {titleBackground && backgroundStyle === "glass" && (
                            <>
                                <div className="absolute -top-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                <div className="absolute -bottom-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            </>
                        )}

                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
                            {words.map((word, wordIndex) => (
                                <span
                                    key={wordIndex}
                                    className="inline-block mr-4 last:mr-0"
                                >
                                    {word.split("").map((letter, letterIndex) => (
                                        <motion.span
                                            key={`${wordIndex}-${letterIndex}`}
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{
                                                delay: wordIndex * 0.1 + letterIndex * 0.03,
                                                type: "spring",
                                                stiffness: 150,
                                                damping: 25,
                                            }}
                                            className="inline-block text-transparent bg-clip-text 
                                                bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 
                                                drop-shadow-2xl"
                                        >
                                            {letter}
                                        </motion.span>
                                    ))}
                                </span>
                            ))}
                        </h1>

                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="mt-6 text-lg sm:text-xl md:text-2xl text-neutral-600 font-light"
                            >
                                {subtitle}
                            </motion.p>
                        )}

                        <motion.div
                            className="mt-8 mx-auto h-1 bg-gradient-to-r from-transparent via-neutral-400 to-transparent"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                        />
                        {children}
                    </motion.div>

                    {titleBackground && (
                        <motion.div
                            className="absolute inset-0 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${30 + (i % 2) * 40}%`,
                                    }}
                                    animate={{
                                        y: [-20, 20, -20],
                                        opacity: [0.3, 0.8, 0.3],
                                    }}
                                    transition={{
                                        duration: 3 + i,
                                        repeat: Number.POSITIVE_INFINITY,
                                        delay: i * 0.5,
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
