import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

function GameCard({ game }) {
  return (
    <div className="game-card">
      <h2>{game.name}</h2>
      <Link to={`/game/${game.id}`}>View Details</Link>
    </div>
  );
}

export default GameCard;