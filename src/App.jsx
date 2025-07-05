import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import MovieCard from './components/MovieCard';
import LoadingCard from './components/LoadingCard';
import Select from 'react-select';

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

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchMovies = async () => {
    setLoading(true);

    try {
      let query = supabase.from('movies').select('*').not('popularity', 'is', null); // Filter out nulls;

      if (selectedGenreId) {
        query = query.contains('genres', [parseInt(selectedGenreId)]);
      }
      if (startYear) {
        query = query.gte('release_year', parseInt(startYear));
      }
      if (endYear) {
        query = query.lte('release_year', parseInt(endYear));
      }

      query = query.order('popularity', { ascending: false }).limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Supabase fetch error:', error);
        setMovies([]);
        setMovie(null);
      } else {
        setMovies(data);
        setCurrentIndex(0);
        setMovie(data[0] || null);
      }
    } catch (err) {
      console.error('Unexpected fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [startYear, endYear, selectedGenreId]);

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(180deg, #1f1c2c 0%, #928DAB 100%)', // NEW
        color: '#fff',
      }}
    >
      <h1> Movie Matcher</h1>
      {loading ? (
        <LoadingCard />
      ) : movie ? (
        <MovieCard
          movie={movie}
          onSwipeLeft={goToNextMovie}
          onSwipeRight={goToNextMovie}
        />
      ) : (
        <p>No movies found.</p>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <button
          onClick={goToNextMovie}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#3a3a3a',
            border: 'none',
            borderRadius: '9999px',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Dislike
        </button>
        <button
          onClick={goToNextMovie}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#f5cfc1',
            border: 'none',
            borderRadius: '9999px',
            color: '#1c1c1c',
            cursor: 'pointer',
          }}
        >
          Like
        </button>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Select
  options={genreOptions}
  defaultValue={genreOptions[0]}
  onChange={(option) => setSelectedGenreId(option.value)}
  styles={{
    control: (base) => ({
      ...base,
      backgroundColor: '#2c2c2c',
      borderRadius: '12px',
      color: 'white',
      border: 'none',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#2c2c2c' }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#444' : '#2c2c2c',
      color: 'white',
    }),
  }}
/>

        <input
          type="number"
          placeholder="From"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '5px', width: '80px' }}
        />
        <input
          type="number"
          placeholder="To"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '5px', width: '80px' }}
        />
      </div>
    </div>
  );
}

export default App;
