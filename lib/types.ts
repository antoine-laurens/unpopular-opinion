export interface Movie {
    id: number;
    title: string;
    release_date: string;
    genre_ids: number[];
    poster_path: string | null;
    overview: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Review {
    id: string;
    author: string;
    content: string;
    created_at: string;
    rating?: number;
}

export interface GameState {
    id: string; // Session token
    reviews: string[]; // List of sanitized reviews
    currentStep: number;
    guesses: GuessResult[];
    status: 'playing' | 'won' | 'lost';
    gameOverData?: {
        movie: Movie;
        genres: Genre[];
    };
}

export interface GuessResult {
    movieTitle: string;
    year: number;
    yearDiff: 'older' | 'newer' | 'same';
    genres: GenreMatch[];
}

export interface GenreMatch {
    name: string;
    match: boolean;
}
