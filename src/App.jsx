import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function MovieCard({ movie }) {
  return (
    <div
      style={{
        width: '300px',
        height: '450px',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '1rem',
        }}
      >
        <h2 style={{ margin: 0 }}>{movie.title}</h2>
        <p style={{ margin: '0.25rem 0' }}>
          <strong>Year:</strong> {movie.release_date?.split('-')[0]}
        </p>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div
      style={{
        width: '300px',
        height: '450px',
        borderRadius: '20px',
        backgroundColor: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#aaa',
        fontSize: '1.2rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      }}
    >
      Loading...
    </div>
  );
}

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchMovies = async () => {
    
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          sort_by: 'popularity.desc',
          page: 1,
          with_genres: selectedGenreId || undefined,
          primary_release_date_gte: startYear ? `${startYear}-01-01` : undefined,
          primary_release_date_lte: endYear ? `${endYear}-12-31` : undefined,
        },
      });

      let fetched = res.data.results;
      if (startYear || endYear) {
        fetched = fetched.filter((movie) => {
          const year = parseInt(movie.release_date?.split('-')[0]);
          return (
            (!startYear || year >= parseInt(startYear)) &&
            (!endYear || year <= parseInt(endYear))
          );
        });
      }

      setMovies(fetched);
      setCurrentIndex(0);
      setMovie(fetched[0] || null);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
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
        backgroundColor: '#111',
        color: '#fff',
      }}
    >
      <h1>🎬 Movie Matcher</h1>
      {loading ? <LoadingCard /> : movie && <MovieCard movie={movie} />}

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
            backgroundColor: '#4CAF50',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Like
        </button>
        <button
          onClick={goToNextMovie}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#f44336',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Dislike
        </button>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <select
          value={selectedGenreId}
          onChange={(e) => setSelectedGenreId(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '5px' }}
        >
          <option value="">All Genres</option>
          <option value="28">Action</option>
          <option value="35">Comedy</option>
          <option value="18">Drama</option>
          <option value="27">Horror</option>
          <option value="10749">Romance</option>
        </select>

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
