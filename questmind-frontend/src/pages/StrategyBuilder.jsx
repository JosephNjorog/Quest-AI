import React, { useState } from 'react';
import { useAgent } from '../context/AgentContext';
import Card from '../components/common/Card';

const StrategyBuilder = () => {
  const { executeCommand, settings, setSettings } = useAgent();
  const [strategy, setStrategy] = useState({
    name: '',
    description: '',
    objectives: [],
    constraints: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeCommand(`Execute strategy: ${strategy.name}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Strategy Builder</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Strategy</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Strategy Name
              </label>
              <input
                type="text"
                value={strategy.name}
                onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={strategy.description}
                onChange={(e) => setStrategy({ ...strategy, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Create Strategy
            </button>
          </form>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Risk Tolerance
              </label>
              <select
                value={settings.riskTolerance}
                onChange={(e) => setSettings({ ...settings, riskTolerance: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Active Quests
              </label>
              <input
                type="number"
                value={settings.maxActiveQuests}
                onChange={(e) => setSettings({ ...settings, maxActiveQuests: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StrategyBuilder;