import api from './api';
import { processCommandWithAI } from '../utils/ai-helpers';

export const agentService = {
  async processCommand(command) {
    // Process command with AI
    const tasks = await processCommandWithAI(command);
    
    // Send to backend
    const response = await api.post('/agent/execute', { command, tasks });
    return response.data;
  },

  async getTaskHistory() {
    const response = await api.get('/agent/history');
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.put('/agent/settings', settings);
    return response.data;
  }
};
