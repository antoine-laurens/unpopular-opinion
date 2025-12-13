"use client";

import { useState } from "react";
import SearchInput from "./SearchInput";
import ReviewDisplay from "./ReviewDisplay";
import Feedback from "./Feedback";
import EndScreen from "./EndScreen";
import { GuessResult, Movie } from "@/lib/types";
import { Clapperboard, Loader2 } from "lucide-react";

export default function GameContainer() {
    const [token, setToken] = useState<string | null>(null);
    const [reviews, setReviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [guesses, setGuesses] = useState<GuessResult[]>([]);
    const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
    const [targetMovie, setTargetMovie] = useState<Movie | null>(null);

    const startGame = async () => {
        setLoading(true);
        setGuesses([]);
        setGameStatus('playing');
        setTargetMovie(null);
        try {
            const res = await fetch('/api/game/start');
            const data = await res.json();
            if (data.token) {
                setToken(data.token);
                setReviews(data.reviews);
            } else {
                console.error("Failed to start game");
                setGameStatus('idle');
            }
        } catch (e) {
            console.error(e);
            setGameStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const handleGuess = async (movie: Movie) => {
        if (!token) return;

        // Optimistic checking? No, we need server validation.
        // Add temporary loading state if needed, but we'll just wait.

        // Check duplicate
        if (guesses.some(g => g.movieTitle === movie.title)) return;

        try {
            const isLastAttempt = guesses.length >= 4;
            const res = await fetch('/api/game/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    guessMovieId: movie.id,
                    revealIfWrong: isLastAttempt
                })
            });

            const data = await res.json();

            if (data.correct) {
                setGameStatus('won');
                setTargetMovie(data.targetMovie);
            } else {
                const newFeedback: GuessResult = data.feedback;
                const newGuesses = [...guesses, newFeedback];
                setGuesses(newGuesses);

                if (newGuesses.length >= 5) {
                    setGameStatus('lost');
                    // If lost, we should have received the target movie in the real app logic?
                    // Wait, I didn't send targetMovie on loss in my API route. I should fix that or fetch it?
                    // I'll fix the API route logic via a patch or just fetch it here if I had the ID? 
                    // I don't have the ID. The API *must* return it on loss.
                    // I'll update the API route logic in a moment.
                    // For now assuming the API will be updated to return `targetMovie` on loss or valid result.
                    if (data.targetMovie) {
                        setTargetMovie(data.targetMovie);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (gameStatus === 'idle') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-amber-500 rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-2xl shadow-amber-500/20">
                    <Clapperboard className="w-12 h-12 text-black" />
                </div>
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 tracking-tight">
                    Bad Movie Guess
                </h1>
                <p className="text-lg text-slate-400 max-w-md mb-10 leading-relaxed">
                    Can you identify the movie based solely on its worst reviews? You have 5 attempts.
                </p>
                <button
                    onClick={startGame}
                    disabled={loading}
                    className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Start Game"}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-800/50">
                <div className="text-xl font-bold flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                        <Clapperboard className="w-5 h-5 text-black" />
                    </div>
                    Bad Movie Guess
                </div>
                <div className="text-sm font-mono bg-slate-900 px-3 py-1 rounded text-slate-400">
                    Attempt {guesses.length + 1}/5
                </div>
            </div>

            {(gameStatus === 'won' || gameStatus === 'lost') && targetMovie ? (
                <EndScreen won={gameStatus === 'won'} movie={targetMovie} onRestart={startGame} />
            ) : (
                <>
                    <ReviewDisplay reviews={reviews} attempts={guesses.length} />

                    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent pt-12 pb-8">
                        <div className="max-w-xl mx-auto">
                            <SearchInput onSelect={handleGuess} disabled={false} />
                        </div>
                    </div>

                    <Feedback guesses={guesses} />
                </>
            )}
        </div>
    );
}
