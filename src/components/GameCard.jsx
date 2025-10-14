import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

function GameCard({ game }) {
  const thumb = game.image || (game.images && game.images[0]) || null;
  const genre = game.genre || '';
  const description = (game.description || '').replace(/\s+/g, ' ').trim();
  const shortDesc = description.length > 140 ? description.slice(0, 137) + '…' : description;
  const firstLink = (game.links && game.links[0] && game.links[0].url) || null;

  return (
    <article className="game-card" aria-labelledby={`game-${game.id}-title`}>
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
          {genre && <span className="genre-badge">{genre}</span>}
        </div>
        {shortDesc ? <p className="desc">{shortDesc}</p> : <p className="desc muted">Sin descripción</p>}
        <div className="card-actions">
          <Link to={`/game/${game.id}`} className="btn small">Detalles</Link>
          {firstLink && (
            <a href={firstLink} className="btn small secondary" target="_blank" rel="noreferrer">Ir al juego</a>
          )}
        </div>
      </div>
    </article>
  );
}

export default GameCard;