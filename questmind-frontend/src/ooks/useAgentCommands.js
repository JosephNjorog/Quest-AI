import { useCallback, useState } from 'react';
import { agentService } from '../services/agent';

export const useAgentCommands = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState(null);

  const executeCommand = useCallback(async (command) => {
    setIsProcessing(true);
    setCurrentCommand(command);
    try {
      const result = await agentService.processCommand(command);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    currentCommand,
    executeCommand
  };
};
