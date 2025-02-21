import api from '../api';

export const dfkService = {
  async fetchHeroes(address) {
    const response = await api.get(`/games/dfk/heroes/${address}`);
    return response.data;
  },

  async sendHeroOnQuest(heroId, questId) {
    const response = await api.post('/games/dfk/quests', { heroId, questId });
    return response.data;
  },

  async claimQuestRewards(questId) {
    const response = await api.post(`/games/dfk/quests/${questId}/claim`);
    return response.data;
  },

  async fetchGameData() {
    const response = await api.get('/games/dfk/data');
    return response.data;
  }
};
