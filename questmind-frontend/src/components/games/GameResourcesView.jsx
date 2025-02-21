import React from 'react';
import { useGame } from '../../context/GameContext';
import Card from '../common/Card';

const GameResourcesView = () => {
  const { resources, isLoading } = useGame();

  if (isLoading) {
    return <div className="animate-pulse">Loading resources...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Game Resources</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(resources).map(([resource, amount]) => (
          <div key={resource} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-600 capitalize">{resource}</h3>
            <p className="text-lg font-semibold mt-1">{amount}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GameResourcesView;
