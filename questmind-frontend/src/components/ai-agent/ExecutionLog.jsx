import React from 'react';
import { useAgent } from '../../context/AgentContext';

const ExecutionLog = () => {
  const { taskHistory } = useAgent();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Execution Log</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {taskHistory.map((task) => (
          <div key={task.id} className="border-b pb-3">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-600">{new Date(task.timestamp).toLocaleString()}</p>
              <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>
            <p className="mt-2 text-gray-800">{task.command}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionLog;