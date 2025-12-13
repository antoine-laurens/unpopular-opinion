import { NextRequest, NextResponse } from 'next/server';
import { verifyGameToken } from '@/lib/game';
import { getMovie, getGenres } from '@/lib/tmdb';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, guessMovieId, revealIfWrong } = body;

        const payload = await verifyGameToken(token);
        if (!payload || !payload.movieId) {
            return NextResponse.json({ error: 'Invalid start' }, { status: 401 });
        }

        const targetId = payload.movieId as number;
        const targetMovie = await getMovie(targetId);

        if (!targetMovie) {
            return NextResponse.json({ error: 'Target movie not found' }, { status: 500 });
        }

        const correct = targetId === guessMovieId;

        if (correct) {
            return NextResponse.json({
                correct: true,
                won: true,
                done: true,
                feedback: null,
                targetMovie // Reveal it
            });
        }

        // If wrong, calculate feedback
        const guessMovie = await getMovie(guessMovieId);
        if (!guessMovie) {
            return NextResponse.json({ error: 'Guess movie not found' }, { status: 400 });
        }

        // Feedback Logic
        // Year
        const targetYear = parseInt(targetMovie.release_date.split('-')[0]);
        const guessYear = parseInt(guessMovie.release_date.split('-')[0]);
        let yearDiff = 'same';
        if (guessYear < targetYear) yearDiff = 'newer'; // Target is newer
        if (guessYear > targetYear) yearDiff = 'older'; // Target is older

        // Genres
        const allGenres = await getGenres();
        const targetGenreIds = targetMovie.genre_ids;
        const guessGenreIds = guessMovie.genre_ids;

        // Map IDs to names for feedback
        const genreFeedback = guessGenreIds.map(id => {
            const genreObj = allGenres.find(g => g.id === id);
            return {
                name: genreObj ? genreObj.name : 'Unknown',
                match: targetGenreIds.includes(id)
            };
        });

        return NextResponse.json({
            correct: false,
            won: false,
            feedback: {
                yearDiff,
                year: guessYear,
                movieTitle: guessMovie.title,
                genres: genreFeedback
            },
            targetMovie: revealIfWrong ? targetMovie : null
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
