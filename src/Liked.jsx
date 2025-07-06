import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MovieCard from './components/MovieCard';

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
        .select('movie_id, like_count, movies ( id, title, poster_path, overview, release_year )')
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
    <div style={{ padding: '2rem', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>Liked Movies</h1>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : likedMovies.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No liked movies yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {likedMovies.map((movie) => (
            <div key={movie.id} style={{ width: '200px' }}>
              <MovieCard movie={movie} />
              <p style={{ textAlign: 'center' }}>❤️ {movie.like_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
