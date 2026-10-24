import React, { useEffect, useRef } from 'react';
import Icon from './Icon';
import { GENRE_OPTIONS, YEAR_RANGE } from '../data/movies';

/**
 * Bottom sheet for the deck filters. Stays mounted so it can animate both
 * ways; `inert` takes it out of the tab order and away from screen readers
 * while closed.
 */
export default function FilterSheet({
  open,
  onClose,
  filters,
  setGenreId,
  setStartYear,
  setEndYear,
  matchCount,
}) {
  const sheet = useRef(null);
  const returnTo = useRef(null);

  // Focus moves into the sheet on open and back to the trigger on close.
  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement;
      sheet.current?.focus();
    } else {
      returnTo.current?.focus?.();
      returnTo.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const active = Boolean(filters.genreId || filters.startYear || filters.endYear);

  const reset = () => {
    setGenreId('');
    setStartYear('');
    setEndYear('');
  };

  return (
    <div className="sheet-root" data-open={open} inert={!open}>
      <div className="sheet-scrim" onClick={onClose} />
      <div
        ref={sheet}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-title"
        tabIndex={-1}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id="filters-title" className="title-lg">
            Filters
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close filters">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="sheet-body">
          <section className="section">
            <h3 className="kicker">Genre</h3>
            <div className="choices">
              {GENRE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className="choice"
                  aria-pressed={filters.genreId === o.value}
                  onClick={() => setGenreId(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <section className="section">
            <h3 className="kicker">Release year</h3>
            <div className="year-range">
              <input
                className="field"
                type="number"
                inputMode="numeric"
                enterKeyHint="next"
                placeholder={String(YEAR_RANGE.min)}
                value={filters.startYear}
                onChange={(e) => setStartYear(e.target.value)}
                aria-label="From year"
              />
              <span className="muted">to</span>
              <input
                className="field"
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                placeholder={String(YEAR_RANGE.max)}
                value={filters.endYear}
                onChange={(e) => setEndYear(e.target.value)}
                aria-label="To year"
              />
            </div>
          </section>
        </div>

        <div className="sheet-foot">
          <button type="button" className="btn btn-secondary" onClick={reset} disabled={!active}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {matchCount === 0
              ? 'No films match'
              : `Show ${matchCount} film${matchCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
