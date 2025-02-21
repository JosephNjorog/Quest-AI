import api from '../api';

export const heroesOfNFTService = {
  async fetchHeroes(address) {
    const response = await api.get(`/games/heroes-of-nft/heroes/${address}`);
    return response.data;
  },

  async startBattle(heroId, battleId) {
    const response = await api.post('/games/heroes-of-nft/battles', { heroId, battleId });
    return response.data;
  },

  async fetchGameData() {
    const response = await api.get('/games/heroes-of-nft/data');
    return response.data;
  }
};
