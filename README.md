# MovieDate

A group movie-night picker. Swipe on films, rank the ones you like with
quick head-to-head picks, then vote in a single-elimination bracket
(up to 16 films) to decide what to watch. Play solo or in a shared room.

## Stack
- Vite + React 19, react-router-dom, plain CSS
- Neon Auth and Neon Data API (Postgres functions hold the game logic)
- Deployed on Vercel; rooms and tournaments sync by 2s polling
- Movie list is local (`src/data/movies.js`); posters load from TMDB

## Run it
1. `npm install`
2. Copy `.env.example` to `.env` and set `VITE_NEON_AUTH_URL` and
   `VITE_NEON_DATA_API_URL` (from your Neon project).
3. `npm run dev`

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Database
The game logic lives in Postgres functions in the Neon project. The SQL
migrations are kept locally and are not committed. After changing a
function, refresh the Data API schema:
`npx neonctl@latest data-api refresh-schema --database neondb`

## Layout
- `src/` pages (`App`, `Liked`, `Rank`, `Rooms`, `Lobby`, `Tournament`, ...)
- `src/components/` shared UI, `src/hooks/` room and tournament polling
- `src/lib/` bracket, ranking and Neon client code
