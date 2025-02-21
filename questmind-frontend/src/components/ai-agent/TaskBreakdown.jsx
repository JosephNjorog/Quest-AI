import React from 'react';
import Card from '../common/Card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TaskBreakdown = ({ tasks }) => {
  const defaultTasks = [
    {
      id: 1,
      description: 'Check hero stamina levels',
      status: 'completed',
      result: 'All heroes have sufficient stamina',
      timestamp: '2025-02-20T15:00:00'
    },
    {
      id: 2,
      description: 'Analyze market prices for magic carrots',
      status: 'completed',
      result: 'Current price: 1.2 JEWEL (15% above average)',
      timestamp: '2025-02-20T15:01:00'
    },
    {
      id: 3,
      description: 'Calculate optimal farming strategy',
      status: 'in_progress',
      timestamp: '2025-02-20T15:02:00'
    },
    {
      id: 4,
      description: 'Execute farming transactions',
      status: 'pending',
      timestamp: '2025-02-20T15:03:00'
    }
  ];

  const currentTasks = tasks || defaultTasks;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Task Breakdown</h2>

      <div className="space-y-6">
        {currentTasks.map((task) => (
          <div key={task.id} className="relative pl-6 pb-6 border-l-2 border-gray-200 last:pb-0">
            <div className="absolute -left-[9px] bg-white">
              {getStatusIcon(task.status)}
            </div>
            
            <div className="space-y-1">
              <p className="font-medium">{task.description}</p>
              {task.result && (
                <p className="text-sm text-gray-600">{task.result}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(task.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default TaskBreakdown;