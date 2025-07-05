import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TMDB_API_KEY = 'caa37c91fa34494ac89cd0f7cb726759';
const BASE_URL = 'https://api.themoviedb.org/3';
const getRandomPage = () => Math.floor(Math.random() * 500) + 1;

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

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomMovie = async () => {
    try {
      setLoading(true);
      const page = getRandomPage();
      const res = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          sort_by: 'popularity.desc',
          page,
        },
      });

      const movies = res.data.results;
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      setMovie(randomMovie);
    } catch (err) {
      console.error('Failed to fetch movie:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMovie();
  }, []);

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
      <h1> Movie Matcher </h1>
      {loading && <p>Loading...</p>}
      {movie && <MovieCard movie={movie} />}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <button
          onClick={fetchRandomMovie}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
        >
           Like
        </button>
        <button
          onClick={fetchRandomMovie}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
        >
           Dislike
        </button>
      </div>
    </div>
  );
}

export default App;
