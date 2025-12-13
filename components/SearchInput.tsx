"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Movie } from "@/lib/types";

interface SearchInputProps {
    onSelect: (movie: Movie) => void;
    disabled?: boolean;
}

export default function SearchInput({ onSelect, disabled }: SearchInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Movie[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 2) {
                try {
                    const res = await fetch(`/api/game/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setResults(data.results || []);
                    setIsOpen(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto z-50">
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Search for a movie..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={disabled}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    name="movie-search"
                />
                <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
                    {results.map((movie) => (
                        <button
                            key={movie.id}
                            className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-800 last:border-none"
                            onClick={() => {
                                onSelect(movie);
                                setQuery("");
                                setIsOpen(false);
                            }}
                        >
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-10 h-14 object-cover rounded bg-slate-800"
                                />
                            ) : (
                                <div className="w-10 h-14 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">No img</div>
                            )}
                            <div>
                                <div className="font-semibold text-white">{movie.title}</div>
                                <div className="text-sm text-slate-400">
                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
