import { Movie, Review, Genre } from './types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY || '');
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
    });

    const res = await fetch(url.toString(), {
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 0 } // No caching for game logic
    });

    if (!res.ok) {
        // Log error but don't crash app if possible
        console.error(`TMDB API Error: ${res.status} ${res.statusText}`);
        throw new Error(`TMDB API Error: ${res.status}`);
    }
    return res.json();
}

export const getGenres = async (): Promise<Genre[]> => {
    try {
        const data = await fetchTMDB('/genre/movie/list');
        return data.genres;
    } catch (e) {
        console.error("Failed to fetch genres", e);
        return [];
    }
}

let cachedGenres: Genre[] = [];
export const getGenreMap = async (): Promise<Record<number, string>> => {
    if (cachedGenres.length === 0) {
        cachedGenres = await getGenres();
    }
    return cachedGenres.reduce((acc, g) => ({ ...acc, [g.id]: g.name }), {} as Record<number, string>);
}

export const searchMovies = async (query: string): Promise<Movie[]> => {
    if (!query) return [];
    try {
        const data = await fetchTMDB('/search/movie', { query, include_adult: false });
        return data.results.slice(0, 5);
    } catch (e) {
        return [];
    }
};

export const getMovie = async (id: number): Promise<Movie | null> => {
    try {
        const data = await fetchTMDB(`/movie/${id}`);
        // Endpoint /movie/:id returns `genres` array of objects, not `genre_ids`.
        // We need to map it to match our Movie interface.
        if (data && data.genres) {
            data.genre_ids = data.genres.map((g: any) => g.id);
        }
        return data;
    } catch (e) {
        return null;
    }
}

export const getMovieReviews = async (id: number): Promise<Review[]> => {
    try {
        const data = await fetchTMDB(`/movie/${id}/reviews`);
        return data.results.map((r: any) => ({
            id: r.id,
            author: r.author,
            content: r.content,
            created_at: r.created_at,
            rating: r.author_details?.rating
        }));
    } catch (e) {
        return [];
    }
};


import { translateText } from './translate';

// ... (existing imports and code)

export const getRandomGameMovie = async (): Promise<{ movie: Movie; reviews: string[] } | null> => {
    let attempts = 0;
    // Try up to 20 times (batches) to find a suitable movie
    while (attempts < 20) {
        attempts++;
        // Increase diversity: Pages 1 to 100
        const page = Math.floor(Math.random() * 100) + 1;
        try {
            const data = await fetchTMDB('/movie/popular', { page });
            const movies = data.results;

            if (!movies || movies.length === 0) continue;

            const shuffled = movies.sort(() => 0.5 - Math.random());

            // Process in batches of 5 to speed up
            const batchSize = 5;
            for (let i = 0; i < shuffled.length; i += batchSize) {
                const batch = shuffled.slice(i, i + batchSize);

                // Fetch reviews for the batch in parallel
                const batchResults = await Promise.all(batch.map(async (movie: Movie) => {
                    const reviews = await getMovieReviews(movie.id);
                    // Filter: Strict bad reviews (rating <= 3) and must have content
                    const validReviews = reviews.filter(r =>
                        r.content.length > 50 &&
                        r.rating !== undefined && r.rating <= 3
                    );

                    if (validReviews.length >= 5) {
                        return { movie, validReviews };
                    }
                    return null;
                }));

                // Find the first valid result in this batch
                const validResult = batchResults.find(r => r !== null);

                if (validResult) {
                    // Update to await the async processReviews
                    const sanitizedReviews = await processReviews(validResult.validReviews, validResult.movie.title);
                    if (sanitizedReviews.length >= 5) {
                        return { movie: validResult.movie, reviews: sanitizedReviews.slice(0, 5) };
                    }
                }
            }

        } catch (e) {
            console.error("Error fetching random movie", e);
        }
    }
    return null;
};

async function processReviews(reviews: Review[], title: string): Promise<string[]> {
    const sorted = [...reviews].sort((a, b) => a.content.length - b.content.length);

    const cleaned: string[] = [];
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Title parts processing
    const titleParts = title.split(/\s+/).filter(p => p.length >= 3 && !/^(the|and|for|with)$/i.test(p));
    const titleRegex = new RegExp(escapeRegExp(title), 'gi');

    for (const r of sorted) {
        let content = r.content;

        // 1. Translate FIRST (English to French)
        // We do this first because redacting "████" and then translating might fail or translate the block chars.
        // However, we need to redact the TITLE.
        // If we translate first, the title in the text might change to French equivalent.
        // Strategy: Translate, then redact the *Translated* title? 
        // Or redact English title from English text, then translate?
        // Let's try: Translate content -> French.
        // We assume the movie.title is also available in French? 
        // Actually `movie.title` from /movie/popular (default) is usually English or Original.
        // We should just redact the *Original* title strings from the *French* text.
        // It's likely the review mentions the title as is, or a French variant.
        // Let's try simple translation first.

        content = await translateText(content, 'fr');

        // Redact full title (using original title string - might catch proper nouns)
        // Note: Translation might have altered it slightly, but usually proper nouns stay.
        content = content.replace(titleRegex, '███████');

        // Redact partial matches
        for (const part of titleParts) {
            const partRegex = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi');
            content = content.replace(partRegex, '...');
        }

        // Clean up
        content = content.replace(/\r\n/g, ' ').replace(/\n/g, ' ');

        if (content.length > 600) {
            content = content.substring(0, 597) + '...';
        }

        cleaned.push(content);
        if (cleaned.length >= 5) break;
    }

    return cleaned;
}

