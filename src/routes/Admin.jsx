import React, { useState, useEffect } from 'react';
import './Admin.css';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabaseClient';

const genres = ["Action", "Adventure", "RPG", "Shooter", "Puzzle", "Sports", "Strategy"];

function Admin({ games, setGames }) {
  const { user, logout } = useAuth();
  const [newGame, setNewGame] = useState({
    name: '',
    links: [{ name: '', url: '' }],
    image: '',
    images: [],
    description: '',
    notes: '',
    genre: ''
  });
  const [filterGenre, setFilterGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = games.filter(
    (game) =>
      (filterGenre === "" || game.genre === filterGenre) &&
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGame = async () => {
    if (!newGame.name) {
      alert('Por favor, completa al menos el nombre del juego.');
      return;
    }
    const payload = {
      name: newGame.name,
      links: newGame.links,
      image: newGame.image,
      images: newGame.images,
      description: newGame.description,
      notes: newGame.notes,
      genre: newGame.genre
    };
    const { data, error } = await supabase.from('games').insert([payload]).select('*');
    if (error) {
      alert('Error al crear juego: ' + error.message);
      return;
    }
    setGames([...(games || []), data[0]]);
    setNewGame({ name: '', links: [{ name: '', url: '' }], image: '', images: [], description: '', notes: '', genre: '' });
  };

  const handleEditGame = async (id, field, value) => {
    const updated = games.map(game => (
      game.id === id ? { ...game, [field]: field === 'links' ? [value] : value } : game
    ));
    setGames(updated);
    const toUpdate = updated.find(g => g.id === id);
    const { error } = await supabase.from('games').update({ [field]: toUpdate[field] }).eq('id', id);
    if (error) {
      alert('Error al actualizar: ' + error.message);
    }
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

  const handleEditImage = (id, newImage) => {
    setGames(games.map(game => (
      game.id === id ? { ...game, image: newImage } : game
    )));
  };

  const handleAddImage = async (id, newImage) => {
    const updated = games.map(game => (
      game.id === id ? { ...game, images: [...(game.images || []), newImage] } : game
    ));
    setGames(updated);
    const current = updated.find(g => g.id === id);
    await supabase.from('games').update({ images: current.images }).eq('id', id);
  };

  const handleRemoveImage = async (id, imageIndex) => {
    const updated = games.map(game => (
      game.id === id ? { ...game, images: (game.images || []).filter((_, index) => index !== imageIndex) } : game
    ));
    setGames(updated);
    const current = updated.find(g => g.id === id);
    await supabase.from('games').update({ images: current.images }).eq('id', id);
  };

  const handleImageUploadToSupabase = async (event, gameId) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = `${gameId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
    } else {
      const imageUrl = `${supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl}`;
      handleAddImage(gameId, imageUrl);
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase.from('games').select('*').order('id');
      if (error) {
        console.error('Error fetching games:', error);
      } else {
        setGames(data);
      }
    };

    fetchGames();
  }, [setGames]);

  const handleDeleteGame = async (id) => {
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) {
      alert('Error al borrar: ' + error.message);
      return;
    }
    setGames((games || []).filter(g => g.id !== id));
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
        <select
          value={newGame.genre || ""}
          onChange={(e) => setNewGame({ ...newGame, genre: e.target.value })}
        >
          <option value="" disabled>Select Genre</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <button onClick={handleAddGame}>Add Game</button>
      </div>
      <div className="filters">
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search games"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ul>
        {filteredGames.map((game) => (
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUploadToSupabase(e, game.id)}
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
            <select
              value={game.genre || ""}
              onChange={(e) => handleEditGame(game.id, 'genre', e.target.value)}
            >
              <option value="" disabled>Select Genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <div className="image-management">
              <h4>Manage Images</h4>
              <div className="image-list">
                {(game.images || []).map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img} alt={`Game Image ${index + 1}`} />
                    <button onClick={() => handleRemoveImage(game.id, index)}>Remove</button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    handleAddImage(game.id, imageUrl);
                  }
                }}
              />
              <button type="button" onClick={() => handleDeleteGame(game.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;