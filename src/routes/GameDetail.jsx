import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './GameDetail.css';

function GameDetail({ games }) {
  const { id } = useParams();
  const game = games.find((game) => game.id === parseInt(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    if (game.images && game.images.length > 0) {
      setCurrentImageIndex((currentImageIndex + 1) % game.images.length);
    }
  };

  const handlePrevImage = () => {
    if (game.images && game.images.length > 0) {
      setCurrentImageIndex((currentImageIndex - 1 + game.images.length) % game.images.length);
    }
  };

  if (!game || !game.images || game.images.length === 0) {
    return (
      <div className="game-detail">
        <h2>{game?.name || 'Game not found'}</h2>
        <p>No images available for this game.</p>
        <p className="game-description">{game?.description}</p>
        <p className="game-notes">Notas: {game?.notes}</p>
        <ul>
          {game?.links?.map((link, index) => (
            <li key={index}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name || link.url}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="game-detail">
      <h2>{game.name}</h2>
      <div className="carousel">
        <button onClick={handlePrevImage} className="carousel-button">&#8249;</button>
        <img
          src={game.images[currentImageIndex]}
          alt={`${game.name} - ${currentImageIndex + 1}`}
          className="game-image"
        />
        <button onClick={handleNextImage} className="carousel-button">&#8250;</button>
      </div>
      <p className="game-description">{game.description}</p>
      <p className="game-notes">Notas: {game.notes}</p>
      <ul>
        {game.links.map((link, index) => (
          <li key={index}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name || link.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GameDetail;