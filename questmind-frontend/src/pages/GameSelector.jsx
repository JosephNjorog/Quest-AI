import React from 'react';
import { useGame } from '../../context/GameContext';

const SUPPORTED_GAMES = [
  { id: 'dfk', name: 'DeFi Kingdoms', icon: '🏰' },
  { id: 'heroes', name: 'Heroes of NFT', icon: '⚔️' }
];

const GameSelector = () => {
  const { selectedGame, setSelectedGame } = useGame();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select Game</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPPORTED_GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedGame === game.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="text-2xl mb-2">{game.icon}</span>
            <h3 className="text-lg font-medium">{game.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSelector;