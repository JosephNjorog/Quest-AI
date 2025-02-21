import React from 'react';
import { Card } from '../common/Card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, ArrowRight, AlertCircle } from 'lucide-react';

const ActiveQuests = () => {
  const quests = [
    {
      id: 1,
      type: "Resource Gathering",
      description: "Farm magic carrots in Garden 7",
      progress: 65,
      timeRemaining: "5h 23m",
      rewards: {
        estimated: "~250 JEWEL",
        items: ["Magic Carrot", "Crystal", "Gold"]
      },
      hero: "Shadowblade",
      status: "in_progress"
    },
    {
      id: 2,
      type: "Combat",
      description: "Complete 3 PvP matches",
      progress: 33,
      timeRemaining: "12h",
      rewards: {
        estimated: "~180 JEWEL",
        items: ["Combat Trophy", "Experience Scroll"]
      },
      hero: "Lightweaver",
      status: "in_progress"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      in_progress: 'text-blue-500',
      completed: 'text-green-500',
      failed: 'text-red-500'
    };
    return colors[status] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Active Quests</h2>
        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
          View All Quests
        </button>
      </div>

      <div className="space-y-4">
        {quests.map((quest) => (
          <Card key={quest.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{quest.type}</h3>
                  <p className="text-sm text-gray-600">{quest.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{quest.timeRemaining}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{quest.progress}%</span>
                </div>
                <Progress value={quest.progress} className="h-2" />
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span>Estimated Rewards:</span>
                </div>
                <span className="font-medium">{quest.rewards.estimated}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Items:</span>
                <div className="flex space-x-2">
                  {quest.rewards.items.map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Hero: {quest.hero}</span>
                <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
        <span className="text-sm text-yellow-700">
          AI Agent is monitoring quests and will optimize strategies as needed
        </span>
      </div>
    </div>
  );
};

export default ActiveQuests;