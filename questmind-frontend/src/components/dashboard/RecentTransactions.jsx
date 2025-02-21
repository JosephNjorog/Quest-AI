import React from 'react';
import Card from '../common/Card';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const RecentTransactions = () => {
  const transactions = [
    {
      id: 1,
      type: 'Quest Reward',
      amount: '+125.5 JEWEL',
      timestamp: '2025-02-20T15:30:00',
      status: 'completed',
      hash: '0x1234...5678'
    },
    {
      id: 2,
      type: 'Purchase Seeds',
      amount: '-50 JEWEL',
      timestamp: '2025-02-20T14:15:00',
      status: 'completed',
      hash: '0x8765...4321'
    },
    {
      id: 3,
      type: 'Hero Training',
      amount: '-25 JEWEL',
      timestamp: '2025-02-20T12:45:00',
      status: 'pending',
      hash: '0x9876...1234'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div 
            key={tx.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              {tx.amount.startsWith('+') ? (
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">{tx.type}</p>
                <p className="text-sm text-gray-600">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {tx.amount}
              </p>
              <p className={`text-sm ${getStatusColor(tx.status)}`}>
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;