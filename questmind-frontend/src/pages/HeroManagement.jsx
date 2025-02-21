import React from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/common/Card';

const HeroManagement = () => {
  const { heroes, updateHero } = useGame();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Hero Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroes.map((hero) => (
          <Card key={hero.id} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full">
                {/* Hero avatar would go here */}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{hero.name}</h3>
                <p className="text-sm text-gray-600">Level {hero.level}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Stamina</span>
                <span>{hero.stamina}/100</span>
              </div>
              <div className="flex justify-between">
                <span>XP</span>
                <span>{hero.xp}/1000</span>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => updateHero(hero.id, { status: 'questing' })}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Send on Quest
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HeroManagement;