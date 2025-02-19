import React, { useState } from 'react';
import { ArrowPathIcon, CommandLineIcon } from '@heroicons/react/24/outline';

interface Instruction {
  id: string;
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  timestamp: number;
}

const InstructionInterface: React.FC = () => {
  const [instruction, setInstruction] = useState('');
  const [history, setHistory] = useState<Instruction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setIsProcessing(true);
    const newInstruction: Instruction = {
      id: Date.now().toString(),
      text: instruction,
      status: 'pending',
      timestamp: Date.now()
    };

    setHistory(prev => [newInstruction, ...prev]);

    try {
      // TODO: Replace with actual API call to your AI backend
      const response = await mockAIProcessing(instruction);
      
      setHistory(prev => prev.map(inst => 
        inst.id === newInstruction.id 
          ? { ...inst, status: 'completed', result: response }
          : inst
      ));
    } catch (error) {
      setHistory(prev => prev.map(inst => 
        inst.id === newInstruction.id 
          ? { ...inst, status: 'failed', result: 'Failed to process instruction' }
          : inst
      ));
    } finally {
      setIsProcessing(false);
      setInstruction('');
    }
  };

  // Mock function to simulate AI processing - replace with actual API call
  const mockAIProcessing = async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `Processed instruction: ${text}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">AI Command Center</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="instruction" className="sr-only">
              Enter your instruction
            </label>
            <input
              type="text"
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., 'Level up my hero' or 'Start farming quest'"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !instruction.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <CommandLineIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {history.map((inst) => (
          <div
            key={inst.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{inst.text}</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                inst.status === 'completed' ? 'bg-green-100 text-green-800' :
                inst.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {inst.status}
              </span>
            </div>
            {inst.result && (
              <p className="text-gray-600 text-sm mt-2">{inst.result}</p>
            )}
            <time className="text-gray-400 text-xs">
              {new Date(inst.timestamp).toLocaleString()}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructionInterface;