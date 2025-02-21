import { useCallback, useState, useEffect } from 'react';
import { dfkService } from '../services/games/dfk';
import { heroesOfNFTService } from '../services/games/heroesOfNFT';

export const useGameData = (gameId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const service = gameId === 'dfk' ? dfkService : heroesOfNFTService;
      const gameData = await service.fetchGameData();
      setData(gameData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refreshData: fetchData };
};