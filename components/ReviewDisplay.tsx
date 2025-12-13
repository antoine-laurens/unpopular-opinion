"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewDisplayProps {
    reviews: string[];
    attempts: number;
}

export default function ReviewDisplay({ reviews, attempts }: ReviewDisplayProps) {
    // Show reviews up to current attempt (0 to attempts)
    // Max reviews is reviews.length.
    // attempts starts at 0. So show reviews[0].
    // If attempts = 1, show reviews[0] and reviews[1].
    const visibleReviews = reviews.slice(0, attempts + 1);

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto mb-8">
            <h3 className="text-amber-500 font-semibold tracking-wider text-sm uppercase mb-2 text-center">
                Bad Reviews ({visibleReviews.length}/{reviews.length})
            </h3>
            <div className="space-y-3">
                <AnimatePresence>
                    {visibleReviews.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`p-4 rounded-lg border border-slate-800 ${idx === visibleReviews.length - 1
                                    ? 'bg-slate-800/80 text-white shadow-lg border-amber-500/30'
                                    : 'bg-slate-900/50 text-slate-400'
                                }`}
                        >
                            <div className="text-xs text-slate-500 mb-1 font-mono">Review #{idx + 1}</div>
                            <p className="italic font-light leading-relaxed">"{review}"</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
