import React, { useState } from 'react';
import Card from '../components/common/Card';
import Input from '../common/Input';
import { Search, Filter, Clock, Star, Award } from 'lucide-react';

const QuestLog = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const quests = [
    {
      id: 1,
      type: 'Farming',
      description: 'Farm magic carrots in Garden 7',
      hero: 'Shadowblade',
      status: 'completed',
      rewards: '125 JEWEL',
      duration: '4h 30m',
      timestamp: '2025-02-20T10:00:00',
      success: true
    },
    {
      id: 2,
      type: 'Combat',
      description: 'Complete PvP matches',
      hero: 'Lightweaver',
      status: 'failed',
      rewards: '0 JEWEL',
      duration: '2h 15m',
      timestamp: '2025-02-20T12:30:00',
      success: false
    },
    // Add more quest history items
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600',
      active: 'text-blue-600',
      failed: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quest Log</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quests..."
              className="pl-10"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="all">All Quests</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {quests.map((quest) => (
          <Card key={quest.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  quest.type === 'Farming' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {quest.type === 'Farming' ? (
                    <Star className="w-6 h-6 text-green-600" />
                  ) : (
                    <Award className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold">{quest.description}</h3>
                  <p className="text-sm text-gray-600">Hero: {quest.hero}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-medium ${getStatusColor(quest.status)}`}>
                  {quest.rewards}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {quest.duration}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(quest.timestamp).toLocaleString()}</span>
              <span className={getStatusColor(quest.status)}>
                {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestLog;