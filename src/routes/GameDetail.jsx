import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './GameDetail.css';

function GameDetail({ games }) {
  const { id } = useParams();
  const game = games.find((game) => game.id === parseInt(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState(game?.images || []);
  useEffect(() => {
    setImages(game?.images || []);
  }, [game]);

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((currentImageIndex + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
    }
  };

  if (!game) {
    return <p>Game not found</p>;
  }

  return (
    <div className="game-detail">
      <h2>{game.name}</h2>
      {(images || []).length > 0 ? (
        <div className="carousel">
          <button onClick={handlePrevImage} className="carousel-button">&#8249;</button>
          <img
            src={images[currentImageIndex]}
            alt={`${game.name} - ${currentImageIndex + 1}`}
            className="game-image"
          />
          <button onClick={handleNextImage} className="carousel-button">&#8250;</button>
        </div>
      ) : (
        <p>No images available for this game.</p>
      )}
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