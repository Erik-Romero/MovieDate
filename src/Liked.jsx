import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Liked({ groupId }) {
  const [likedMovies, setLikedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedMovies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_movie_likes')
        .select('movie_id, like_count, movies ( id, title, release_year, poster_path, overview )')
        .eq('group_id', groupId)
        .order('like_count', { ascending: false });

      if (error) {
        console.error('Error fetching liked movies:', error);
        setLikedMovies([]);
      } else {
        const formatted = data.map(entry => ({
          ...entry.movies,
          like_count: entry.like_count
        }));
        setLikedMovies(formatted);
      }
      setLoading(false);
    };

    if (groupId) fetchLikedMovies();
  }, [groupId]);

  return (
    <div style={{ padding: '2rem', maxHeight: '100vh', backgroundColor: '#111', color: '#fff', minHeight: '100vh', overflowY: 'auto' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>Liked Movies</h1>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : likedMovies.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No liked movies yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {likedMovies.map((movie) => (
            <li
              key={movie.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '1px solid #444'
              }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{movie.title}</strong>
                <p style={{ margin: '0.2rem 0' }}>Year: {movie.release_year || 'N/A'}</p>
                <p style={{ margin: '0.2rem 0' }}>Likes: {movie.like_count}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                  {movie.overview || 'No description available.'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
