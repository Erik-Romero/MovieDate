# ReelMatch — local POC

Same app, no backend. Every Supabase query and TMDB call is gone; the deck
reads from `src/data/movies.js`.

## Drop-in

Copy `src/` over your existing one, then:

```bash
npm uninstall @supabase/supabase-js react-select
rm src/App.css src/components/LikedCards.jsx src/supabaseClient.js src/components/LoginHandler.js
npm run dev -- --host
```

Remaining dependencies: `react`, `react-dom`, `react-router-dom`, `react-swipeable`.
No `.env` needed anymore.

## Files

| File | What it does |
|---|---|
| `data/movies.js` | 30 films, genre map, mock group members. The only place data lives. |
| `hooks/useSwipeDeck.js` | Swipe state, filters, undo, matches. Replaces every Supabase query. |
| `components/MovieCard.jsx` | The swipe card. |
| `components/Poster.jsx` | Artwork with a generated gradient fallback. |
| `components/MovieRow.jsx` | List row on the Liked screen. Replaces `LikedCards.jsx`. |
| `App.jsx` | Swipe screen. |
| `Liked.jsx` | Liked + Matches tabs. |
| `Login.jsx` | Captures a name and group into local state. |
| `index.css` | All styles. `App.css` is folded in here. |

## The data file

```js
{
  id: 31,
  title: 'Heat',
  release_year: 1995,
  genres: [28, 80, 18],      // TMDB genre IDs, see GENRES at the top
  vote_average: 8.3,
  popularity: 70,            // controls deck order, higher shows first
  overview: 'One sentence.',
}
```

Add rows and everything downstream updates — the genre dropdown only lists
genres present in the data, and the year placeholders track the real min/max.

### Posters

By default there's no artwork, so cards render a gradient generated from the
title. That's deliberate: it works with zero network and looks intentional
rather than broken.

To use real images, add either field to a movie:

```js
poster: '/posters/heat.jpg',                  // file in your public/ folder
poster: 'https://example.com/heat.jpg',       // any URL
poster_path: '/zMyfPUelumio3tiDKPffaUpsQTD.jpg',  // TMDB path, auto-prefixed
```

The TMDB image CDN doesn't need an API key, so pasting real `poster_path`
values in still counts as zero API calls.

### Matches

`MOCK_MEMBERS` stands in for other people in your group. Like something on
their list and it shows up under the Matches tab. Edit the IDs to test.

## What changed beyond deleting Supabase

**Fixed a real swipe bug.** The original `onSwiped` read `rotation` from
component state to decide whether a swipe counted. That state is set inside
`onSwiping`, so on fast flicks it could still be stale and the swipe would be
dropped. It now reads `deltaX` off the event directly.

**No more `currentIndex`.** The deck is derived — filter out anything already
swiped, apply filters, sort by popularity — so `deck[0]` is always the current
card. That removes the index/refetch dance and made undo about four lines.

**Mobile fixes**, the ones from the setup notes:
- `100dvh` instead of `100vh`, so cards aren't cut off under Safari's address bar
- `overscroll-behavior: none`, so a downward drag doesn't trigger pull-to-refresh
- `touch-action: pan-y` on the card, so vertical scroll works but horizontal
  belongs to the swipe handler
- 16px minimum font on inputs, so iOS doesn't zoom on focus
- safe-area padding so buttons clear the home indicator

**Native `<select>` instead of `react-select`.** One less dependency, and on a
phone it opens the OS picker, which beats a custom dropdown.

**Details are behind a "Read more" toggle** rather than requiring you to scroll
the card. Scrolling a card you're also trying to swipe is a fight.

## Not included

No persistence — reload clears your swipes. For a POC that's usually what you
want while testing. If you'd rather keep them, `useSwipeDeck` is the only file
that needs to change: seed `useState` from `localStorage` and write back in a
`useEffect`.
