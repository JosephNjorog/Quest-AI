import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ArrowUpRight, Activity, Wallet, Clock } from 'lucide-react';

const DashboardOverview = () => {
  const stats = [
    {
      title: 'Active Quests',
      value: '3',
      change: '+2',
      icon: <Activity className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Resources Gathered',
      value: '1,234',
      change: '+147',
      icon: <ArrowUpRight className="w-6 h-6 text-green-500" />
    },
    {
      title: 'Wallet Balance',
      value: '532 AVAX',
      change: '+21.2%',
      icon: <Wallet className="w-6 h-6 text-purple-500" />
    },
    {
      title: 'Time Active',
      value: '47h',
      change: '2.3h today',
      icon: <Clock className="w-6 h-6 text-orange-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button>Create New Quest</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {stat.icon}
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="text-sm text-green-600">{stat.change}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;