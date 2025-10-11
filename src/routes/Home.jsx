import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GameCard from '../components/GameCard';
import './Home.css';

const genres = ["Action", "Adventure", "RPG", "Shooter", "Puzzle", "Sports", "Strategy"];

function Home({ games }) {
  const [filterGenre, setFilterGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [banner, setBanner] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.loggedIn) {
      setBanner('Sesión iniciada correctamente');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredGames = games.filter(
    (game) =>
      (filterGenre === "" || game.genre === filterGenre) &&
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {banner && (
        <div className="login-banner">{banner}</div>
      )}
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
      <div className="game-list">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

export default Home;