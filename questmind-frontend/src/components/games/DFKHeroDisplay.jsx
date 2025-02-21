import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Star, Clock } from 'lucide-react';

const DFKHeroDisplay = () => {
  const [selectedHero, setSelectedHero] = useState(null);

  const heroes = [
    {
      id: 1,
      name: "Shadowblade",
      class: "Thief",
      level: 12,
      stats: {
        strength: 85,
        agility: 92,
        endurance: 78,
        wisdom: 65
      },
      status: "questing",
      questEndTime: "2h 15m",
      rarity: "rare"
    },
    {
      id: 2,
      name: "Lightweaver",
      class: "Priest",
      level: 15,
      stats: {
        strength: 62,
        agility: 70,
        endurance: 85,
        wisdom: 95
      },
      status: "available",
      rarity: "legendary"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      questing: 'bg-blue-100 text-blue-800',
      resting: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    };
    return colors[rarity] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Heroes</h2>
        <Badge variant="outline" className="px-2 py-1">
          {heroes.length} Heroes
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heroes.map((hero) => (
          <Card 
            key={hero.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedHero?.id === hero.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedHero(hero)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{hero.name}</h3>
                <p className="text-sm text-gray-600">Level {hero.level} {hero.class}</p>
              </div>
              <Star className={`w-5 h-5 ${getRarityColor(hero.rarity)}`} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Sword className="w-4 h-4 text-red-500" />
                <span className="text-sm">STR: {hero.stats.strength}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">AGI: {hero.stats.agility}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-green-500" />
                <span className="text-sm">END: {hero.stats.endurance}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-sm">WIS: {hero.stats.wisdom}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Badge className={getStatusColor(hero.status)}>
                {hero.status.charAt(0).toUpperCase() + hero.status.slice(1)}
              </Badge>
              {hero.questEndTime && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {hero.questEndTime}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedHero && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Start Quest
            </button>
            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
              Train Hero
            </button>
            <button className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DFKHeroDisplay;