import React, { useState } from 'react';
import './Admin.css';
import { useAuth } from '../auth/AuthContext';

function Admin({ games, setGames }) {
  const { user, logout } = useAuth();
  const [newGame, setNewGame] = useState({
    name: '',
    links: [{ name: '', url: '' }],
    image: '',
    images: [],
    description: '',
    notes: ''
  });

  const handleAddGame = () => {
    if (newGame.name && newGame.links[0].url) {
      setGames([...games, { ...newGame, id: games.length + 1 }]);
      setNewGame({ name: '', links: [{ name: '', url: '' }], image: '', images: [], description: '', notes: '' });
    } else {
      alert('Por favor, completa al menos el nombre y el enlace del juego.');
    }
  };

  const handleEditGame = (id, field, value) => {
    setGames(games.map(game => (
      game.id === id ? { ...game, [field]: field === 'links' ? [value] : value } : game
    )));
  };

  const handleAddLink = () => {
    setNewGame({
      ...newGame,
      links: [...newGame.links, { name: '', url: '' }]
    });
  };

  const handleEditLink = (index, field, value) => {
    const updatedLinks = newGame.links.map((link, i) => (
      i === index ? { ...link, [field]: value } : link
    ));
    setNewGame({ ...newGame, links: updatedLinks });
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = newGame.links.filter((_, i) => i !== index);
    setNewGame({ ...newGame, links: updatedLinks });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setNewGame({ ...newGame, images: [...(newGame.images || []), ...imageUrls] });
  };

  if (!user) {
    return <p>Access denied. Please log in.</p>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <button onClick={logout}>Logout</button>
      <div>
        <input
          type="text"
          placeholder="Game Name"
          value={newGame.name}
          onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newGame.image}
          onChange={(e) => setNewGame({ ...newGame, image: e.target.value })}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="image-upload"
        />
        <textarea
          placeholder="Descripción"
          value={newGame.description}
          onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
          rows="3"
        />
        <textarea
          placeholder="Notas"
          value={newGame.notes}
          onChange={(e) => setNewGame({ ...newGame, notes: e.target.value })}
          rows="3"
        />
        <div>
          {newGame.links.map((link, index) => (
            <div key={index} className="link-item">
              <input
                type="text"
                placeholder="Nombre del enlace"
                value={link.name}
                onChange={(e) => handleEditLink(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="URL del enlace"
                value={link.url}
                onChange={(e) => handleEditLink(index, 'url', e.target.value)}
              />
              <button type="button" onClick={() => handleRemoveLink(index)}>Eliminar</button>
            </div>
          ))}
          <button type="button" onClick={handleAddLink}>Agregar Enlace</button>
        </div>
        <button onClick={handleAddGame}>Add Game</button>
      </div>
      <ul>
        {games.map(game => (
          <li key={game.id} className="game-item">
            <input
              type="text"
              value={game.name}
              onChange={(e) => handleEditGame(game.id, 'name', e.target.value)}
              placeholder="Nombre del juego"
            />
            <input
              type="text"
              value={game.links[0].url}
              onChange={(e) => handleEditGame(game.id, 'links', e.target.value)}
              placeholder="Enlace del juego"
            />
            <input
              type="text"
              value={game.image}
              onChange={(e) => handleEditGame(game.id, 'image', e.target.value)}
              placeholder="URL de la imagen"
            />
            <textarea
              value={game.description}
              onChange={(e) => handleEditGame(game.id, 'description', e.target.value)}
              placeholder="Descripción"
              rows="2"
            />
            <textarea
              value={game.notes}
              onChange={(e) => handleEditGame(game.id, 'notes', e.target.value)}
              placeholder="Notas"
              rows="2"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;