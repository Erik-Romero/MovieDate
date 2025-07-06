import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import MovieCard from './components/MovieCard';
import LoadingCard from './components/LoadingCard';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

const genreOptions = [
  { value: '', label: 'All Genres' },
  { value: '28', label: 'Action' },
  { value: '35', label: 'Comedy' },
  { value: '18', label: 'Drama' },
  { value: '27', label: 'Horror' },
  { value: '10749', label: 'Romance' },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App({ userInfo }) {
  const { userId, groupId } = userInfo;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const fetchMovies = async () => {
  setLoading(true);
  try {
    // Get swiped movie IDs
    const { data: swipes, error: swipeError } = await supabase
      .from('user_swipes')
      .select('movie_id')
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (swipeError) throw swipeError;

    const swipedMovieIds = swipes.map((swipe) => swipe.movie_id);

    let query = supabase.from('movies').select('*').not('popularity', 'is', null);

    if (selectedGenreId) {
      query = query.contains('genres', [parseInt(selectedGenreId)]);
    }
    if (startYear) {
      query = query.gte('release_year', parseInt(startYear));
    }
    if (endYear) {
      query = query.lte('release_year', parseInt(endYear));
    }
    if (swipedMovieIds.length > 0) {
      query = query.not('id', 'in', `(${swipedMovieIds.join(',')})`);
    }

    query = query.order('popularity', { ascending: false }).limit(100);

    const { data, error } = await query;

    if (error) throw error;

    setMovies(data);
    setCurrentIndex(0);
    setMovie(data[0] || null);
  } catch (err) {
    console.error('Fetch error:', err.message);
    setMovies([]);
    setMovie(null);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (userId && groupId) fetchMovies();
  }, [startYear, endYear, selectedGenreId, userId, groupId]);

  const handleSwipe = async (liked) => {
    const swipedMovie = movies[currentIndex];
    if (!swipedMovie) return;

    await supabase.from('user_swipes').insert({
      user_id: userId,
      group_id: groupId,
      movie_id: swipedMovie.id,
      swipe: liked ? 'like' : 'dislike',
    });

    if (liked) {
  console.log("Incrementing like for group:", groupId, "movie:", swipedMovie.id);

  const { error } = await supabase.rpc('increment_like', {
  group_id_input: groupId,
  movie_id_input: swipedMovie.id,
});

  if (error) {
    console.error('Error incrementing like:', error);
  } else {
    console.log('Successfully incremented like');
  }
}

    goToNextMovie();
  };

  const goToNextMovie = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < movies.length) {
      setCurrentIndex(nextIndex);
      setMovie(movies[nextIndex]);
    } else {
      fetchMovies();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'linear-gradient(180deg, #1f1c2c 0%, #928DAB 100%)', color: '#fff' }}>
      <h1>Movie Matcher</h1>
      {loading ? (
        <LoadingCard />
      ) : movie ? (
        <MovieCard movie={movie} onSwipeLeft={() => handleSwipe(false)} onSwipeRight={() => handleSwipe(true)} />
      ) : (
        <p>No movies found.</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={() => handleSwipe(false)} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#3a3a3a', border: 'none', borderRadius: '9999px', color: '#ffffff', cursor: 'pointer' }}>Dislike</button>
        <button onClick={() => handleSwipe(true)} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#f5cfc1', border: 'none', borderRadius: '9999px', color: '#1c1c1c', cursor: 'pointer' }}>Like</button>
      </div>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Select
          options={genreOptions}
          defaultValue={genreOptions[0]}
          onChange={(option) => setSelectedGenreId(option.value)}
          styles={{
            control: (base) => ({ ...base, backgroundColor: '#2c2c2c', borderRadius: '12px', color: 'white', border: 'none' }),
            singleValue: (base) => ({ ...base, color: 'white' }),
            menu: (base) => ({ ...base, backgroundColor: '#2c2c2c' }),
            option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#444' : '#2c2c2c', color: 'white' }),
          }}
        />
        <input type="number" placeholder="From" value={startYear} onChange={(e) => setStartYear(e.target.value)} style={{ padding: '0.5rem', borderRadius: '5px', width: '80px' }} />
        <input type="number" placeholder="To" value={endYear} onChange={(e) => setEndYear(e.target.value)} style={{ padding: '0.5rem', borderRadius: '5px', width: '80px' }} />
        <button onClick={() => navigate('/liked')} style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: '#f5cfc1', color: '#1c1c1c', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
        View Liked Movies
      </button>
      </div>
    </div>
  );
}

export default App;
