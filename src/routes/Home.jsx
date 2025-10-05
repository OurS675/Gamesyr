import React from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import './Home.css';

function Home({ games }) {
  return (
    <div className="game-list">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
      
    </div>
  );
}

export default Home;