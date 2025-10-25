import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameCard.css';

function GameCard({ game }) {
  const defaultPlaceholder = import.meta.env.VITE_DEFAULT_PLACEHOLDER_IMAGE || 'https://placehold.co/300x150/1a2a3a/ffffff/png?text=Game';
  const thumb = game.image || (game.images && game.images[0]) || defaultPlaceholder;
  // thumbnail image
  // (we intentionally avoid link-button logic here; the card always opens details)
  const navigate = useNavigate();

  const handleOpen = (e) => {
    // Always navigate to internal detail view when the card itself is clicked.
    // The action button/link (inside .card-actions) will open external URLs
    // and stops propagation so this handler won't run for that click.
    navigate(`/game/${game.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <article
      className="game-card"
      aria-labelledby={`game-${game.id}-title`}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      {thumb ? (
        <img src={thumb} alt={`${game.name} cover`} className="thumb" />
      ) : (
        <div className="thumb placeholder" role="img" aria-label={`${game.name} placeholder`}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="24" rx="4" fill="rgba(255,255,255,0.04)" />
            <path d="M4 17c1.333-2 3-3 5-3s3.667 1 5 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          </svg>
        </div>
      )}
      <div className="card-body">
        <div className="meta-row">
          <h3 id={`game-${game.id}-title`}>{game.name}</h3>
        </div>
        {/* action buttons removed per request - card click opens detail view */}
      </div>
    </article>
  );
}

export default GameCard;