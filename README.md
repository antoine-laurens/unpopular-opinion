# Bad Movie Guess Game

A web game where you guess mystery movies based on their "bad" reviews.

## Setup

1.  **Install Dependencies**:
    Since the automatic installation failed in the agent environment, you need to install the dependencies manually:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```bash
    cp .env.local.example .env.local
    ```
    Open `.env.local` and add your **TMDB API Key**:
    ```
    TMDB_API_KEY=your_key_here
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    GAME_SECRET=some_long_random_string_for_security
    ```

3.  **Run the Game**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

*   **Mystery Movie**: Selected automatically from popular movies.
*   **Bad Reviews**: Reviews are fetched and sorted (shortest/vaguest first).
*   **Feedback**:
    *   **Year**: Older/Newer/Same.
    *   **Genres**: Green matches, Red mismatches.
*   **Progressive Reveal**: One new review per wrong guess.
*   **Win/Loss**: 5 attempts maximum.

## Tech Stack

*   **Next.js 14** (App Router)
*   **Tailwind CSS**
*   **Framer Motion** (Animations)
*   **Lucide React** (Icons)
*   **Jose** (Stateless Loop / JWT)
# unpopular-opinion
# unpopular-opinion
# unpopular-opinion
