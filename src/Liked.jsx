import React from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from './components/MovieRow';
import Icon from './components/Icon';
import LoadingScreen from './components/LoadingScreen';
import { MIN_SIZE } from './lib/bracket';

export default function Liked({ deck }) {
  const { liked, loading } = deck;
  const navigate = useNavigate();

  if (loading) return <LoadingScreen label="Loading your likes" />;

  const canBracket = liked.length >= MIN_SIZE;

  return (
    <div className="screen">
      <header className="page-head">
        <p className="kicker">Your shortlist</p>
        <div className="page-head-row">
          <h1 className="title-xl">Liked</h1>
          {liked.length > 0 && (
            <span className="count">
              {liked.length} film{liked.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </header>

      {liked.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Icon name="heart" size={24} />
          </span>
          <p className="empty-title">No likes yet</p>
          <p className="empty-body">Swipe right on something and it lands here.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Back to swiping
          </button>
        </div>
      ) : (
        <>
          <section className="cta-card" aria-labelledby="bracket-title">
            <span className="cta-icon">
              <Icon name="trophy" size={22} />
            </span>
            <div>
              <h2 id="bracket-title" className="cta-title">
                Bracket your likes
              </h2>
              <p className="cta-body">
                {canBracket
                  ? 'Pit your favorites head-to-head until one is left.'
                  : `Like at least ${MIN_SIZE} films first — ${MIN_SIZE - liked.length} to go.`}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => navigate('/tournament')}
              disabled={!canBracket}
            >
              Start tourney
              <Icon name="arrow-right" size={18} />
            </button>
          </section>

          <ul className="rows">
            {liked.map((movie) => (
              <MovieRow key={movie.id} movie={movie} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
