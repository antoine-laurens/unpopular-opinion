"use client";
import { GuessResult, GenreMatch } from "@/lib/types";
import { ArrowUp, ArrowDown, Check, X } from "lucide-react";

export default function Feedback({ guesses }: { guesses: GuessResult[] }) {
    if (guesses.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 space-y-3">
            {guesses.map((guess, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="text-white font-medium">{guess.movieTitle}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {guess.genres.map((g, gi) => (
                                <span key={gi} className={`text-xs px-2 py-0.5 rounded-full ${g.match ? 'bg-green-900 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                        <div className={`px-3 py-1 rounded bg-slate-800 flex items-center gap-2 border ${guess.yearDiff === 'same' ? 'border-green-500 text-green-400' : 'border-slate-700 text-slate-300'
                            }`}>
                            <span>{guess.year}</span>
                            {guess.yearDiff === 'newer' && <ArrowUp className="w-4 h-4 text-amber-500" />}
                            {guess.yearDiff === 'older' && <ArrowDown className="w-4 h-4 text-blue-500" />}
                            {guess.yearDiff === 'same' && <Check className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
