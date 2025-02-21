import React, { createContext, useContext, useState, useCallback } from 'react';

const AgentContext = createContext({});

export const AgentProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [settings, setSettings] = useState({
    riskTolerance: 'medium',
    maxActiveQuests: 5,
    updateInterval: 5
  });

  const executeCommand = useCallback(async (command) => {
    setIsProcessing(true);
    try {
      // Implement AI command processing logic here
      const task = {
        id: Date.now(),
        command,
        status: 'processing',
        timestamp: new Date().toISOString()
      };
      setCurrentTask(task);
      setTaskHistory(prev => [task, ...prev]);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update task status
      const updatedTask = { ...task, status: 'completed' };
      setCurrentTask(updatedTask);
      setTaskHistory(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      
      return updatedTask;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <AgentContext.Provider value={{
      isProcessing,
      currentTask,
      taskHistory,
      settings,
      setSettings,
      executeCommand
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
