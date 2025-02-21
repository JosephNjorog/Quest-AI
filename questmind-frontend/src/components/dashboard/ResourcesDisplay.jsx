import React from 'react';
import Card from '../common/Card';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

const ResourcesDisplay = () => {
  const resources = [
    {
      name: 'JEWEL',
      amount: '1,234.56',
      value: '$2,469.12',
      change: '+12.5%'
    },
    {
      name: 'Magic Carrots',
      amount: '5,678',
      value: '~450 JEWEL',
      change: '-3.2%'
    },
    {
      name: 'Crystal Shards',
      amount: '892',
      value: '~120 JEWEL',
      change: '+8.7%'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Resources</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div 
            key={resource.name}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-medium">{resource.name}</h3>
              <p className="text-sm text-gray-600">{resource.amount}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{resource.value}</p>
              <p className={`text-sm flex items-center justify-end ${
                resource.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {resource.change.startsWith('+') ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                {resource.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ResourcesDisplay;