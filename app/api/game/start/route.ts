import { NextResponse } from 'next/server';
import { getRandomGameMovie } from '@/lib/tmdb';
import { createGameToken } from '@/lib/game';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const gameData = await getRandomGameMovie();

        if (!gameData) {
            return NextResponse.json({ error: 'Failed to generate game' }, { status: 500 });
        }

        const { movie, reviews } = gameData;

        // Create detailed token payload or just ID?
        // Just ID is enough if we trust client state, but verifying logic requires ID.
        const token = await createGameToken({ movieId: movie.id });

        return NextResponse.json({
            token,
            reviews,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
