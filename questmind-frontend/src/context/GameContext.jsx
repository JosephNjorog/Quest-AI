import React, { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext({});

export const GameProvider = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState('dfk');
  const [heroes, setHeroes] = useState([]);
  const [resources, setResources] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchGameData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Implement game data fetching logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update state with fetched data
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGame]);

  const updateHero = useCallback(async (heroId, updates) => {
    setHeroes(prev => prev.map(hero => 
      hero.id === heroId ? { ...hero, ...updates } : hero
    ));
  }, []);

  return (
<GameContext.Provider value={{
    selectedGame,
    setSelectedGame,
    heroes,
    setHeroes,
    resources,
    setResources,
    isLoading,
    fetchGameData,
    updateHero
  }}>
    {children}
  </GameContext.Provider>
);
};
export const useGame = () => useContext(GameContext);