import React, { useState, useEffect } from 'react';
import './Admin.css';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabaseClient';
import { uploadFile, getPublicUrl } from '../utils/storage';

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

  // --- Link management for existing games ---
  const handleAddLinkToGame = async (id) => {
    try {
      const prev = games.slice();
      const updated = games.map(game => (
        game.id === id ? { ...game, links: [...(game.links || []), { name: '', url: '' }] } : game
      ));
      setGames(updated);

      const current = updated.find(g => g.id === id);
      const { error } = await supabase.from('games').update({ links: current.links }).eq('id', id);
      if (error) {
        console.error('Error adding link to DB:', error);
        alert('Error al agregar el enlace: ' + error.message);
        setGames(prev);
      }
    } catch (error) {
      console.error('Error en handleAddLinkToGame:', error);
      alert('Error inesperado al agregar enlace');
    }
  };

  const handleEditLinkForGame = async (gameId, index, field, value) => {
    try {
      const prev = games.slice();
      const updated = games.map(game => {
        if (game.id !== gameId) return game;
        const links = (game.links || []).map((ln, i) => i === index ? { ...ln, [field]: value } : ln);
        return { ...game, links };
      });
      setGames(updated);

      const current = updated.find(g => g.id === gameId);
      const { error } = await supabase.from('games').update({ links: current.links }).eq('id', gameId);
      if (error) {
        console.error('Error updating link in DB:', error);
        alert('Error al actualizar el enlace: ' + error.message);
        setGames(prev);
      }
    } catch (error) {
      console.error('Error en handleEditLinkForGame:', error);
      alert('Error inesperado al editar enlace');
    }
  };

  const handleRemoveLinkFromGame = async (gameId, index) => {
    try {
      const prev = games.slice();
      const updated = games.map(game => {
        if (game.id !== gameId) return game;
        const links = (game.links || []).filter((_, i) => i !== index);
        return { ...game, links };
      });
      setGames(updated);

      const current = updated.find(g => g.id === gameId);
      const { error } = await supabase.from('games').update({ links: current.links }).eq('id', gameId);
      if (error) {
        console.error('Error removing link from DB:', error);
        alert('Error al eliminar el enlace: ' + error.message);
        setGames(prev);
      }
    } catch (error) {
      console.error('Error en handleRemoveLinkFromGame:', error);
      alert('Error inesperado al eliminar enlace');
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
    try {
      // Actualizar el estado local inmediatamente
      const updated = games.map(game => (
        game.id === id ? { ...game, images: [...(game.images || []), newImage] } : game
      ));
      setGames(updated);
      
      // Actualizar en la base de datos
      const current = updated.find(g => g.id === id);
      const { error } = await supabase.from('games').update({ images: current.images }).eq('id', id);
      
      if (error) {
        console.error('Error al actualizar imágenes en la base de datos:', error);
        alert('Error al guardar la imagen en la base de datos');
        // Revertir el cambio local si hay error
        setGames(games);
        return;
      }
      
      console.log('Imagen agregada exitosamente al juego:', id);
    } catch (error) {
      console.error('Error en handleAddImage:', error);
      alert('Error inesperado al agregar la imagen');
    }
  };

  const handleRemoveImage = async (id, imageIndex) => {
    try {
      // Obtener la imagen que se va a eliminar para logging
      const gameToUpdate = games.find(g => g.id === id);
      const imageToRemove = gameToUpdate?.images?.[imageIndex];
      
      // Actualizar el estado local inmediatamente
      const updated = games.map(game => (
        game.id === id ? { ...game, images: (game.images || []).filter((_, index) => index !== imageIndex) } : game
      ));
      setGames(updated);
      
      // Actualizar en la base de datos
      const current = updated.find(g => g.id === id);
      const { error } = await supabase.from('games').update({ images: current.images }).eq('id', id);
      
      if (error) {
        console.error('Error al eliminar imagen de la base de datos:', error);
        alert('Error al eliminar la imagen de la base de datos');
        // Revertir el cambio local si hay error
        setGames(games);
        return;
      }
      
      console.log('Imagen eliminada exitosamente del juego:', id, 'Imagen:', imageToRemove);
    } catch (error) {
      console.error('Error en handleRemoveImage:', error);
      alert('Error inesperado al eliminar la imagen');
    }
  };

  const handleImageUploadToSupabase = async (event, gameId) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Crear un nombre único para evitar conflictos
      const timestamp = Date.now();
      const fileName = `${gameId}/${timestamp}_${file.name}`;
      
      console.log('Subiendo imagen:', fileName);
      const { data, error, path } = await uploadFile(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        // Mostrar mensaje claro al usuario
        alert('Error al subir la imagen: ' + (error.message || JSON.stringify(error)));
        return;
      }

      // Usar la ruta sanitizada que devuelve el helper (path)
      const imageUrl = getPublicUrl(path || fileName);
      console.log('Imagen subida exitosamente:', imageUrl);
      
      // Actualizar inmediatamente en el estado local y en la base de datos
      await handleAddImage(gameId, imageUrl);
      
      // Limpiar el input file
      event.target.value = '';
      
    } catch (error) {
      console.error('Error en handleImageUploadToSupabase:', error);
      alert('Error inesperado al subir la imagen');
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

    // Configurar suscripción en tiempo real para cambios en la tabla games
    const subscription = supabase
      .channel('games-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games' 
        }, 
        (payload) => {
          console.log('Cambio detectado en la tabla games:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setGames(prevGames => [...prevGames, payload.new]);
              break;
            case 'UPDATE':
              setGames(prevGames => 
                prevGames.map(game => 
                  game.id === payload.new.id ? payload.new : game
                )
              );
              break;
            case 'DELETE':
              setGames(prevGames => 
                prevGames.filter(game => game.id !== payload.old.id)
              );
              break;
            default:
              // Para cualquier otro evento, refrescar toda la lista
              fetchGames();
          }
        }
      )
      .subscribe();

    // Cleanup: cancelar suscripción cuando el componente se desmonte
    return () => {
      subscription.unsubscribe();
    };
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
            <div className="links-section">
              <h5>Enlaces</h5>
              {(game.links || []).map((link, idx) => (
                <div key={idx} className="link-row">
                  <input
                    type="text"
                    value={link.name || ''}
                    placeholder="Nombre del enlace"
                    onChange={(e) => handleEditLinkForGame(game.id, idx, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    value={link.url || ''}
                    placeholder="URL del enlace"
                    onChange={(e) => handleEditLinkForGame(game.id, idx, 'url', e.target.value)}
                  />
                  <button type="button" onClick={() => handleRemoveLinkFromGame(game.id, idx)}>Eliminar</button>
                </div>
              ))}
              <button type="button" onClick={() => handleAddLinkToGame(game.id)}>Agregar enlace</button>
            </div>
            
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
              <h4>Gestión de Imágenes ({(game.images || []).length} imágenes)</h4>
              <div className="image-list">
                {(game.images || []).map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img} alt={`Game Image ${index + 1}`} style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                    <button 
                      onClick={() => handleRemoveImage(game.id, index)}
                      className="remove-image-btn"
                      title="Eliminar imagen"
                    >
                      ❌ Eliminar
                    </button>
                  </div>
                ))}
              </div>
              <div className="image-upload-section">
                <label htmlFor={`file-upload-${game.id}`} className="file-upload-label">
                  📁 Subir nueva imagen
                </label>
                <input
                  id={`file-upload-${game.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUploadToSupabase(e, game.id)}
                  style={{display: 'none'}}
                />
                <small>Formatos soportados: JPG, PNG, GIF</small>
              </div>
              <button type="button" onClick={() => handleDeleteGame(game.id)} className="delete-game-btn">🗑️ Eliminar Juego</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;