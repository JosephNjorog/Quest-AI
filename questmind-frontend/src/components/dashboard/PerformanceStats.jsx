import React from 'react';
import Card from '../common/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceStats = () => {
  const performanceData = [
    { date: '2025-02-14', quests: 12, revenue: 450 },
    { date: '2025-02-15', quests: 15, revenue: 580 },
    { date: '2025-02-16', quests: 8, revenue: 320 },
    { date: '2025-02-17', quests: 18, revenue: 690 },
    { date: '2025-02-18', quests: 20, revenue: 780 },
    { date: '2025-02-19', quests: 16, revenue: 620 },
    { date: '2025-02-20', quests: 22, revenue: 850 }
  ];

  const stats = [
    { label: 'Total Quests', value: '111' },
    { label: 'Success Rate', value: '94.5%' },
    { label: 'Avg. Daily Revenue', value: '584 JEWEL' },
    { label: 'Active Time', value: '156h' }
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Performance Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="quests" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PerformanceStats;