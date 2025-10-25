import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { useLoading } from '../context/LoadingContext';
import './Home.css';

const genres = ["Action", "Adventure", "RPG", "Shooter", "Puzzle", "Sports", "Strategy"];
const years = ["2023", "2022", "2021", "2020", "2019", "2018", "Older"];
const ratings = ["5 Stars", "4+ Stars", "3+ Stars", "All Ratings"];

function Home({ games }) {
  const [filterGenre, setFilterGenre] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [banner, setBanner] = useState("");
  const location = useLocation();
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    // Mostrar el loader al cargar la página
    showLoader();
    
    // Simular tiempo de carga o esperar a que los datos estén listos
    const timer = setTimeout(() => {
      hideLoader();
    }, 800); // Tiempo suficiente para mostrar la animación
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (location.state?.loggedIn) {
      setBanner('Sesión iniciada correctamente');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredGames = games.filter(
    (game) => {
      // Filtro básico por nombre y género
      const matchesBasicFilters = 
        (filterGenre === "" || game.genre === filterGenre) &&
        game.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtros avanzados (solo aplicar si están seleccionados)
      const matchesYearFilter = !filterYear || 
        (filterYear === "Older" ? parseInt(game.year) < 2018 : game.year === filterYear);
      
      const matchesRatingFilter = !filterRating || 
        (filterRating === "5 Stars" ? game.rating === 5 :
         filterRating === "4+ Stars" ? game.rating >= 4 :
         filterRating === "3+ Stars" ? game.rating >= 3 : true);
      
      return matchesBasicFilters && matchesYearFilter && matchesRatingFilter;
    }
  );

  // Obtener juegos destacados (los 3 con mayor rating)
  const featuredGames = [...games]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <div>
      {banner && (
        <div className="login-banner">{banner}</div>
      )}
      
      {/* Sección de juegos destacados */}
      <div className="featured-games-section">
        <h2>Juegos Destacados</h2>
        <div className="featured-games">
          {featuredGames.map(game => (
            <div key={game.id} className="featured-game">
              <Link to={`/game/${game.id}`}>
                <img 
                  src={game.image_url || 'https://placehold.co/300x150?text=Game'} 
                  alt={game.name} 
                  className="featured-game-image"
                />
                <div className="featured-game-info">
                  <h3>{game.name}</h3>
                  <div className="featured-game-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {(game.rating || 0) > i ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="search-container">
        <div className="basic-filters">
          <input
            type="text"
            placeholder="Search games"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="advanced-toggle"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          >
            {showAdvancedSearch ? "Hide Filters" : "Advanced Search"}
          </button>
        </div>
        
        {showAdvancedSearch && (
          <div className="advanced-filters">
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              {ratings.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
            
            <button 
              className="reset-filters"
              onClick={() => {
                setFilterGenre("");
                setFilterYear("");
                setFilterRating("");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
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