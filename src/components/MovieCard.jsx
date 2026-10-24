import React, { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import Poster from './Poster';
import Icon from './Icon';
import { genreNames } from '../data/movies';

const COMMIT_PX = 110; // projected travel that counts as a decision
const LOCK_PX = 8; // movement before a press becomes a drag
const SAMPLE_MS = 100; // window for release velocity
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
// Slight overshoot on snap-back: the release carried momentum, so a little
// settle reads as physical rather than scripted.
const EASE_SETTLE = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

// Momentum projection from Apple's "Designing Fluid Interfaces" (v in px/ms).
// A quick flick lands far past where the finger let go, so it commits even
// when the drag itself was short.
const project = (v, rate = 0.99) => (v * rate) / (1 - rate);

// Grab the top half and the card tips away from you; grab the bottom and it
// tips the other way — the way a real card pivots around your finger.
const tilt = (x, fromTop) => Math.max(-20, Math.min(20, x / 18)) * (fromTop ? 1 : -1);

/**
 * Writes the drag straight to the DOM. Re-rendering React on every
 * pointermove is wasted work, and the stamps, tint and the card underneath
 * all need to follow the same value in the same frame.
 */
function paint(els, x, y, rot, timing = '') {
  const t = timing ? ` ${timing}` : '';
  const { card, like, nope, likeTint, nopeTint, behind } = els;

  card.style.transition = timing ? `transform${t}` : 'none';
  card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;

  const p = Math.max(-1, Math.min(1, x / COMMIT_PX));
  for (const [el, o] of [
    [like, p],
    [likeTint, p],
    [nope, -p],
    [nopeTint, -p],
  ]) {
    el.style.transition = timing ? `opacity${t}` : 'none';
    el.style.opacity = String(Math.max(0, o));
  }

  // The next card rises to meet you as this one leaves.
  if (behind) {
    const k = Math.abs(p);
    behind.style.transition = timing ? `transform${t}` : 'none';
    behind.style.transform = `translateY(${5 * (1 - k)}%) scale(${0.94 + 0.06 * k})`;
    const dim = behind.querySelector('.card-dim');
    if (dim) {
      dim.style.transition = timing ? `opacity${t}` : 'none';
      dim.style.opacity = String(0.5 * (1 - k));
    }
  }
}

/** Poster plus the title block. Shared by the live card and the one underneath. */
export function CardFace({ movie, interactive = false }) {
  const [open, setOpen] = useState(false);
  const genres = genreNames(movie.genres);

  return (
    <div className="card-face">
      <Poster movie={movie} />
      <div className="card-info">
        <h2 className="card-title">{movie.title}</h2>
        <p className="card-meta">
          <span>{movie.release_year}</span>
          {movie.vote_average != null && (
            <>
              <span className="meta-sep" aria-hidden="true" />
              <span className="rating">
                <Icon name="star" size={12} />
                {Number(movie.vote_average).toFixed(1)}
              </span>
            </>
          )}
        </p>

        {genres.length > 0 && (
          <div className="chips">
            {genres.map((name) => (
              <span key={name} className="chip">
                {name}
              </span>
            ))}
          </div>
        )}

        {movie.overview && (
          <>
            <button
              type="button"
              className="card-more"
              aria-expanded={open}
              tabIndex={interactive ? 0 : -1}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Hide details' : 'Read more'}
              <Icon name="chevron-down" size={14} />
            </button>
            {open && <p className="card-overview">{movie.overview}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The draggable top card.
 *
 * ref exposes fling('left' | 'right') so the buttons below the deck throw the
 * card the same way a swipe does instead of making it vanish. enterFrom brings
 * a card back in from the side it left by (undo).
 */
export default function MovieCard({ movie, onSwipe, behindRef, enterFrom = null, ref }) {
  const card = useRef(null);
  const like = useRef(null);
  const nope = useRef(null);
  const likeTint = useRef(null);
  const nopeTint = useRef(null);
  const gesture = useRef(null);
  const dragged = useRef(false);
  const gone = useRef(false);

  const els = () => ({
    card: card.current,
    like: like.current,
    nope: nope.current,
    likeTint: likeTint.current,
    nopeTint: nopeTint.current,
    behind: behindRef?.current ?? null,
  });

  const offscreen = (sign) => sign * (window.innerWidth / 2 + card.current.offsetWidth * 1.1);

  const commit = (dir, from = { x: 0, y: 0, fromTop: true }, v = 0) => {
    if (gone.current) return;
    gone.current = true;
    const toX = offscreen(dir === 'right' ? 1 : -1);
    // Leave at the speed the finger was moving, never slower than a brisk throw.
    const speed = Math.max(Math.abs(v), 1.6);
    const ms = Math.round(Math.min(360, Math.max(200, Math.abs(toX - from.x) / speed)));
    paint(els(), toX, from.y * 1.6, tilt(toX, from.fromTop), `${ms}ms ${EASE_OUT}`);
    window.setTimeout(() => onSwipe(dir), ms);
  };

  useImperativeHandle(ref, () => ({
    fling: (dir) => {
      if (!gesture.current?.active) commit(dir);
    },
  }));

  // Undo: start off-screen on the side the card left by, then glide back.
  // Mount-only on purpose — each card is keyed by movie id.
  useLayoutEffect(() => {
    if (!enterFrom) return;
    const x = offscreen(enterFrom === 'right' ? 1 : -1);
    paint(els(), x, 0, tilt(x, true));
    card.current.getBoundingClientRect(); // commit the start position before transitioning
    paint(els(), 0, 0, 0, `440ms ${EASE_OUT}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e) => {
    if (gone.current || gesture.current) return; // ignore a second finger mid-drag
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragged.current = false;
    const r = card.current.getBoundingClientRect();
    gesture.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      x: 0,
      y: 0,
      active: false,
      fromTop: e.clientY - r.top < r.height / 2,
      samples: [],
    };
  };

  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;

    if (!g.active) {
      if (Math.hypot(dx, dy) < LOCK_PX) return;
      // Mostly vertical: it's a scroll through the details, not a swipe.
      if (Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null;
        return;
      }
      g.active = true;
      dragged.current = true;
      card.current.setPointerCapture(e.pointerId);
      card.current.classList.add('is-dragging');
    }

    // 1:1 horizontally from where they grabbed; vertical follows loosely.
    g.x = dx;
    g.y = dy * 0.3;
    g.samples.push({ x: dx, t: e.timeStamp });
    while (g.samples.length > 2 && e.timeStamp - g.samples[0].t > SAMPLE_MS) g.samples.shift();
    paint(els(), g.x, g.y, tilt(g.x, g.fromTop));
  };

  const onPointerEnd = (e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    gesture.current = null;
    if (!g.active) return;
    card.current.classList.remove('is-dragging');

    // Velocity over the last ~100ms only: a finger that stopped before
    // lifting shouldn't throw the card.
    const recent = g.samples.filter((s) => e.timeStamp - s.t <= SAMPLE_MS);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const v = recent.length > 1 ? (last.x - first.x) / Math.max(1, last.t - first.t) : 0;
    const landing = g.x + project(v);

    if (e.type === 'pointerup' && Math.abs(landing) >= COMMIT_PX) {
      commit(landing > 0 ? 'right' : 'left', g, v);
    } else {
      paint(els(), 0, 0, 0, `420ms ${EASE_SETTLE}`);
    }
  };

  return (
    <div
      ref={card}
      className="card card-top"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={(e) => {
        // a drag that ends over "Read more" shouldn't also toggle it
        if (dragged.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <CardFace movie={movie} interactive />
      <span ref={likeTint} className="card-tint card-tint-like" aria-hidden="true" />
      <span ref={nopeTint} className="card-tint card-tint-nope" aria-hidden="true" />
      <span ref={like} className="stamp stamp-like" aria-hidden="true">
        LIKE
      </span>
      <span ref={nope} className="stamp stamp-nope" aria-hidden="true">
        NOPE
      </span>
    </div>
  );
}
