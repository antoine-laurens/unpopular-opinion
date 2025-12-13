import { Movie, Genre } from "@/lib/types";
import { Award, Frown, RefreshCw } from "lucide-react";

interface EndScreenProps {
    won: boolean;
    movie: Movie;
    onRestart: () => void;
}

export default function EndScreen({ won, movie, onRestart }: EndScreenProps) {
    return (
        <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="mb-6 flex justify-center">
                {won ? (
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 text-green-500">
                        <Award className="w-10 h-10" />
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500 text-red-500">
                        <Frown className="w-10 h-10" />
                    </div>
                )}
            </div>

            <h2 className="text-3xl font-bold mb-2 text-white">
                {won ? "You Won!" : "Game Over"}
            </h2>
            <p className="text-slate-400 mb-8">
                {won ? "Incredible detective work!" : "Better luck next time."}
            </p>

            <div className="bg-slate-800 rounded-xl p-6 max-w-sm mx-auto mb-8 border border-slate-700">
                <div className="text-sm text-slate-500 mb-2 uppercase tracking-wide">The Movie Was</div>
                {movie.poster_path && (
                    <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        className="w-32 mx-auto rounded-lg shadow-xl mb-4"
                        alt={movie.title}
                    />
                )}
                <h3 className="text-xl font-bold text-white mb-1">{movie.title}</h3>
                <p className="text-slate-400">
                    {movie.release_date.split('-')[0]}
                </p>
            </div>

            <button
                onClick={onRestart}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
                <RefreshCw className="w-5 h-5" />
                Play Again
            </button>
        </div>
    );
}
