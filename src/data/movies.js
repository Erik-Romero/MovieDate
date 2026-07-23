// ---------------------------------------------------------------------------
// Local dataset. This replaces every Supabase query and TMDB call in the POC.
// Edit freely — nothing here talks to a network.
//
// Movie shape:
//   id            number   unique, used as the swipe key
//   title         string
//   release_year  number
//   genres        number[] TMDB genre IDs (see GENRES below)
//   vote_average  number   0-10, placeholder values — tweak to taste
//   popularity    number   0-100, controls deck order (higher shows first)
//   overview      string
//   poster        string?  full URL or local path, e.g. '/posters/dune.jpg'
//   poster_path   string?  TMDB-style path, e.g. '/abc123.jpg' (auto-prefixed)
//
// Leave both poster fields off and the card renders a generated gradient with
// the title set large. That's the default so the app works with zero network.
// See README for how to swap in real artwork.
// ---------------------------------------------------------------------------

export const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const MOVIES = [
  {
    id: 1,
    title: 'Mad Max: Fury Road',
    release_year: 2015,
    genres: [28, 12, 878],
    vote_average: 8.1,
    popularity: 92,
    overview:
      'A war captain and a captive drifter steal a tanker and run it across the desert, chased by the warlord they both escaped.',
  },
  {
    id: 2,
    title: 'John Wick',
    release_year: 2014,
    genres: [28, 53, 80],
    vote_average: 7.4,
    popularity: 85,
    overview:
      'A retired hitman comes out of retirement after a gangster\u2019s son takes the last thing tying him to his late wife.',
  },
  {
    id: 3,
    title: 'The Dark Knight',
    release_year: 2008,
    genres: [28, 80, 18, 53],
    vote_average: 9.0,
    popularity: 98,
    overview:
      'An anarchist in clown paint sets out to prove that Gotham\u2019s order is a thin coat of paint over something worse.',
  },
  {
    id: 4,
    title: 'Die Hard',
    release_year: 1988,
    genres: [28, 53],
    vote_average: 8.2,
    popularity: 74,
    overview:
      'A cop visiting his estranged wife\u2019s office party ends up the only thing standing between thieves and a vault.',
  },
  {
    id: 5,
    title: 'Blade Runner 2049',
    release_year: 2017,
    genres: [878, 18, 53],
    vote_average: 8.0,
    popularity: 81,
    overview:
      'A synthetic detective pulls a thread on a buried case and finds something that shouldn\u2019t be possible.',
  },
  {
    id: 6,
    title: 'Arrival',
    release_year: 2016,
    genres: [878, 18, 9648],
    vote_average: 7.9,
    popularity: 77,
    overview:
      'A linguist is handed the job of asking twelve alien ships what they want, before someone decides to shoot first.',
  },
  {
    id: 7,
    title: 'Inception',
    release_year: 2010,
    genres: [28, 878, 12],
    vote_average: 8.4,
    popularity: 95,
    overview:
      'A crew that steals from dreams takes the opposite job: plant an idea deep enough that the target thinks it was his.',
  },
  {
    id: 8,
    title: 'The Matrix',
    release_year: 1999,
    genres: [28, 878],
    vote_average: 8.2,
    popularity: 93,
    overview:
      'A programmer learns the world he lives in is rendered, and that the people running it would rather he hadn\u2019t.',
  },
  {
    id: 9,
    title: 'Interstellar',
    release_year: 2014,
    genres: [12, 18, 878],
    vote_average: 8.3,
    popularity: 96,
    overview:
      'With Earth\u2019s soil failing, a former pilot leaves his kids behind to look for somewhere else to put them.',
  },
  {
    id: 10,
    title: 'Dune',
    release_year: 2021,
    genres: [878, 12],
    vote_average: 7.8,
    popularity: 88,
    overview:
      'A noble family is handed control of the galaxy\u2019s most valuable planet, which is the trap.',
  },
  {
    id: 11,
    title: 'The Grand Budapest Hotel',
    release_year: 2014,
    genres: [35, 18],
    vote_average: 8.1,
    popularity: 72,
    overview:
      'A hotel concierge and his lobby boy inherit a painting, a murder charge, and a war closing in around them.',
  },
  {
    id: 12,
    title: 'Superbad',
    release_year: 2007,
    genres: [35],
    vote_average: 7.6,
    popularity: 61,
    overview:
      'Two friends with one month of high school left decide the night hinges entirely on buying alcohol.',
  },
  {
    id: 13,
    title: 'Hot Fuzz',
    release_year: 2007,
    genres: [28, 35, 9648],
    vote_average: 7.8,
    popularity: 58,
    overview:
      'London\u2019s best officer is exiled to a village with no crime, which turns out to be the suspicious part.',
  },
  {
    id: 14,
    title: 'Groundhog Day',
    release_year: 1993,
    genres: [35, 14, 10749],
    vote_average: 8.0,
    popularity: 64,
    overview:
      'A weatherman covering a small-town festival wakes up to the same morning until he stops being awful.',
  },
  {
    id: 15,
    title: 'Whiplash',
    release_year: 2014,
    genres: [18, 10402],
    vote_average: 8.5,
    popularity: 79,
    overview:
      'A drummer at a competitive conservatory gets the mentor he wanted, who turns out to be a weapon pointed at him.',
  },
  {
    id: 16,
    title: 'Parasite',
    release_year: 2019,
    genres: [35, 53, 18],
    vote_average: 8.5,
    popularity: 90,
    overview:
      'A family talks its way one by one into the employ of a wealthy household, until the basement has other plans.',
  },
  {
    id: 17,
    title: 'There Will Be Blood',
    release_year: 2007,
    genres: [18, 36],
    vote_average: 8.2,
    popularity: 57,
    overview:
      'An oil prospector buys a valley out from under the people living on it, and collects his debts slowly.',
  },
  {
    id: 18,
    title: 'Moonlight',
    release_year: 2016,
    genres: [18],
    vote_average: 7.4,
    popularity: 52,
    overview:
      'Three chapters in one man\u2019s life, each one about what he\u2019s allowed to admit he wants.',
  },
  {
    id: 19,
    title: 'Hereditary',
    release_year: 2018,
    genres: [27, 9648, 53],
    vote_average: 7.3,
    popularity: 69,
    overview:
      'After her mother\u2019s funeral, a woman starts finding evidence that the family was never really hers.',
  },
  {
    id: 20,
    title: 'The Thing',
    release_year: 1982,
    genres: [27, 9648, 878],
    vote_average: 8.2,
    popularity: 63,
    overview:
      'An Antarctic research crew discovers something that copies people, and no test they run can be trusted twice.',
  },
  {
    id: 21,
    title: 'Get Out',
    release_year: 2017,
    genres: [27, 9648, 53],
    vote_average: 7.7,
    popularity: 76,
    overview:
      'A weekend meeting his girlfriend\u2019s parents goes from awkward to something he can\u2019t drive away from.',
  },
  {
    id: 22,
    title: 'Alien',
    release_year: 1979,
    genres: [27, 878],
    vote_average: 8.5,
    popularity: 82,
    overview:
      'A commercial towing crew answers a distress signal and brings the reason for it back on board.',
  },
  {
    id: 23,
    title: 'Before Sunrise',
    release_year: 1995,
    genres: [18, 10749],
    vote_average: 8.1,
    popularity: 49,
    overview:
      'Two strangers get off a train in Vienna and spend one night deciding whether to ever see each other again.',
  },
  {
    id: 24,
    title: 'Eternal Sunshine of the Spotless Mind',
    release_year: 2004,
    genres: [878, 18, 10749],
    vote_average: 8.3,
    popularity: 78,
    overview:
      'A man pays to have an ex erased from his memory and spends the procedure trying to hide her somewhere inside it.',
  },
  {
    id: 25,
    title: 'La La Land',
    release_year: 2016,
    genres: [35, 18, 10402, 10749],
    vote_average: 7.9,
    popularity: 83,
    overview:
      'A jazz pianist and an aspiring actress push each other toward the careers that pull them apart.',
  },
  {
    id: 26,
    title: 'Prisoners',
    release_year: 2013,
    genres: [80, 18, 53, 9648],
    vote_average: 8.1,
    popularity: 71,
    overview:
      'When two girls vanish, one father decides the detective is too slow and starts his own interrogation.',
  },
  {
    id: 27,
    title: 'No Country for Old Men',
    release_year: 2007,
    genres: [80, 18, 53],
    vote_average: 8.2,
    popularity: 73,
    overview:
      'A welder finds two million dollars in the desert and learns what gets sent after money like that.',
  },
  {
    id: 28,
    title: 'Sicario',
    release_year: 2015,
    genres: [28, 80, 18, 53],
    vote_average: 7.6,
    popularity: 67,
    overview:
      'An FBI agent joins a cartel task force and slowly realizes nobody will tell her whose operation it is.',
  },
  {
    id: 29,
    title: 'Spirited Away',
    release_year: 2001,
    genres: [16, 10751, 14],
    vote_average: 8.6,
    popularity: 87,
    overview:
      'A sullen girl takes a job in a bathhouse for spirits to buy back her parents and her own name.',
  },
  {
    id: 30,
    title: 'Spider-Man: Into the Spider-Verse',
    release_year: 2018,
    genres: [16, 28, 12],
    vote_average: 8.4,
    popularity: 89,
    overview:
      'A Brooklyn teenager gets powers he didn\u2019t ask for, plus five other people who already have them.',
  },
];

// ---------------------------------------------------------------------------
// Stand-in for the group-matching feature. In the real app these came from
// Supabase. Here they're fixed, so the Matches screen has something to show
// as soon as you start swiping.
// ---------------------------------------------------------------------------

export const MOCK_MEMBERS = [
  { name: 'Sam', likedIds: [3, 7, 8, 9, 10, 22, 27, 30] },
  { name: 'Jordan', likedIds: [11, 15, 16, 18, 23, 24, 25, 29] },
];

// --- helpers ---------------------------------------------------------------

export function genreNames(ids = []) {
  return ids.map((id) => GENRES[id]).filter(Boolean);
}

/** Genre list for the filter dropdown, only genres actually present in MOVIES. */
export const GENRE_OPTIONS = [
  { value: '', label: 'All genres' },
  ...Object.entries(GENRES)
    .filter(([id]) => MOVIES.some((m) => m.genres.includes(Number(id))))
    .map(([id, label]) => ({ value: id, label }))
    .sort((a, b) => a.label.localeCompare(b.label)),
];

export const YEAR_RANGE = {
  min: Math.min(...MOVIES.map((m) => m.release_year)),
  max: Math.max(...MOVIES.map((m) => m.release_year)),
};
